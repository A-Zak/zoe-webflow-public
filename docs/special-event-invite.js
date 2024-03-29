
// helper to parse recommendators to a nice usable string
const parseRecommenders = (recommendations) => {

    var onlyRecommenderNames = _.map(recommendations, (r) => r.recommenderFullName)
        
    return _.reduce(onlyRecommenderNames, (allRecommenders, aRecommender, key) => {
        if (key < onlyRecommenderNames.length - 1)
            return `${allRecommenders}, ${aRecommender}`
        else
            return `${allRecommenders} and ${aRecommender}`
    })
}

const getElementRefs = () => {
    return {
        hideLoaderButton: $('#hide-loader-button').get(0), // get 0 is because of jqurey / webflow 🤷‍♂️

        //  Reference to Webflow UI ements
        inviteFirstName1: $('#invite-first-name'),
        inviteFirstName2: $('#invite-first-name2'),

        // RSVP elements
        inviteRsvpYesButton: $('#invite-rsvp-yes-button'),
        inviteRsvpNoButton: $('#invite-rsvp-no-button'),
        inviteRsvpChangeButton1: $('#invite-rsvp-change-button-1'),
        inviteRsvpChangeButton2: $('#invite-rsvp-change-button-2'),

        // recommendations elements
        recommendationsBlock: $('#invite-recommendations-block'),

        expandedRecommendationContainer: $('#expanded-recommendation-container'),

        recommendationsText: $('#invite-recommendations-text'),
        recommendationsName1: $('#invite-recommendations-name'),
        recommendationsName2: $('#invite-recommendations-name2'),
        recommendationsImage1: $('#invite-recommendations-image'),
        recommendationsImage2: $('#invite-recommendations-image2'),
        recommendationsIntro: $('#recommendations-intro'),

        tabs: {
            inviteFlow: {
                invite: $('#invite-tab-invite'),
                noInvitations: $('#invite-tab-no-invitations'),
            },
            rsvp: {
                toAnswer: $('#tab-rsvp-to-answer'),
                yes: $('#tab-rsvp-yes'),
                no: $('#tab-rsvp-no'),
            }
        }
    }
}


const createRegistrationform = (options) => {
    let {token, hidden, onReadyCallback, onDoneCallback} = options

    return window.tf.createPopup(token, {
        hidden, // hidden variables
        size: 80, //percentage of screen (only on desktop)
        onReady: ()=> {
            console.log("tp on ready")
            if (onReadyCallback) onReadyCallback()
        },
        onSubmit: ()=> {
            console.log("tp on submit")
            if (onDoneCallback) onDoneCallback()
        }
    })
}

const updateRSVP = (db, inviteId, rsvpValue, onSuccess) => {
    if (inviteId == "") 
        return
    if (rsvpValue != "YES" && rsvpValue != "NO" && rsvpValue != "MAYBE")
        return

    const inviteRef = doc(db, "invitations", inviteId)
    updateDoc(inviteRef, {rsvp: rsvpValue})
        .then(() => {
            // call success method
            if (onSuccess) onSuccess()
        })
}

const updateCompletedRegistrationForm = (db, inviteId, onSuccess) => {

    const inviteRef = doc(db, "invitations", inviteId)
    updateDoc(inviteRef, {completedRegForm: true})
        .then(() => {
            // call success method
            if (onSuccess) onSuccess()
        })
}


const hookupRsvpButtons = (eRef, inviteData, db, inviteId)=> {

    const regForm = createRegistrationform({
        token: "O880cuug", // experience registration
        hidden: { 
            name: inviteData.firstName,
            responder_full_name: inviteData.fullName,
        }, 
        onDoneCallback: () => {
            updateCompletedRegistrationForm(db, inviteId, () => {
                // todo: close form?
            })
        }
    })


    eRef.inviteRsvpYesButton.on("click", () => { 
        updateRSVP(db, inviteId, "YES", () => {
            eRef.tabs.rsvp.yes.click()
            regForm.toggle()
        }) 
    })

    eRef.inviteRsvpNoButton.on("click", () => { 
        updateRSVP(db, inviteId, "NO", () => {
            eRef.tabs.rsvp.no.click()
        }) 
    })

    eRef.inviteRsvpChangeButton1.on("click", () => eRef.tabs.rsvp.toAnswer.click())
    eRef.inviteRsvpChangeButton2.on("click", () => eRef.tabs.rsvp.toAnswer.click())
}


const containsHeb = (str) => {
    return (/[\u0590-\u05FF]/).test(str);
}


const hookupRecommendationInfo = (rData, rElements) => {
    rElements.expandedContainer
            .find('.recommender-name')
            .text(rData.recommenderFullName)
    rElements.expandedContainer
            .find('.recommender-pic')
            .attr("src", rData.recommenderProfilePic)
    rElements.expandedContainer
            .find('.recommendation-text')
            .text(rData.recommendationText)

    if (containsHeb(rData.recommendationText))
        rElements.expandedContainer
            .find('.recommendation-text')
            .css('text-align', 'right')


    rElements.buttonPic
        .attr("src", rData.recommenderProfilePic)
}

const hookupRecommendationElements = (eRef, inviteData) => {
    if (inviteData.recommendations && inviteData.recommendations.length > 0) {

        console.log("recommendations in invite: ", inviteData.recommendations.length)


        if (inviteData.recommendations.length == 1)
            eRef.recommendationsIntro.text(`We've received a recommendation from one of our valued members, ${inviteData.recommendations[0].recommenderFullName}, who believes you would be a great fit for our upcoming event.`)
        else {
            let wordNumbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
            eRef.recommendationsIntro.text(`We've received a recommendation from ${wordNumbers[inviteData.recommendations.length]} of our valued members, ${parseRecommenders(inviteData.recommendations)}, who believe you would be a great fit for our upcoming event.`)
        }

        let aRecommendation = inviteData.recommendations.pop()

        hookupRecommendationInfo(aRecommendation, {
            expandedContainer: eRef.expandedRecommendationContainer,
            buttonPic: eRef.recommendationsImage1
        })

        while (inviteData.recommendations.length) {
            aRecommendation = inviteData.recommendations.pop()

            let currExpandedRecommendation = eRef.expandedRecommendationContainer.clone()
            let currSmallImage = eRef.recommendationsImage1.clone()

            hookupRecommendationInfo(aRecommendation, {
                expandedContainer: currExpandedRecommendation,
                buttonPic: currSmallImage
            })

            eRef.expandedRecommendationContainer.after(currExpandedRecommendation)
            eRef.recommendationsImage1.parent().append(currSmallImage)
        }

    }
    else {
        eRef.recommendationsBlock.hide()
    }
}


const hookupElements = (eRef, inviteData, db, inviteId) => {
    
    // update invitee name(s)
    eRef.inviteFirstName1.text(inviteData.firstName)
    eRef.inviteFirstName2.text(inviteData.firstName)

    hookupRsvpButtons(eRef, inviteData, db, inviteId)
    hookupRecommendationElements(eRef, inviteData)
}


const gotoCorrectRsvpTab = (rsvpTabs, inviteData) => {
    let rsvpTab = rsvpTabs.toAnswer
    if (inviteData.rsvp == "YES")
        rsvpTab = rsvpTabs.yes
    else if (inviteData.rsvp == "NO")
        rsvpTab = rsvpTabs.no

    rsvpTab.click()
}









// ============================
//       flow starts here
// ============================


var Webflow = window.Webflow || [];
Webflow.push(async function () {

    let {profile} = await zoe.initFbApp()

    const elementsRef = getElementRefs()
    window.elementsRef = elementsRef // good for debug


    let eventId = "YV9FfZBzYNULABhtQimT" // YOKO Connect event id
    let eventDetails = (await zoe.api.getEventDetails({eventId})).data
    

    if (!eventDetails || eventDetails.error) {
        // redir back to dashboard
        location.href = '/app/dashboard'
        return
    }

    // TODO: check if user is member, if not redir / different tab.
    // TODO: check if user invited, if not redir / different tab.



    // TODO: if event is not visibility == "open", and you're not on the invite list, redir to '/app/dashbord'
    // TODO: also if event type is Special event (which should not appear in the app). Alternativly (possibly) add filter in getEventDetails 💪

    console.log("eventDetails", eventDetails.event)
    console.log("profile", profile)
    // hookupElements(elementsRef, eventDetails.event, profile, eventId)

    // elementsRef.hideLoaderButton.click()
})




// var Webflow = window.Webflow || [];
// Webflow.push(function () {

//     const {app, db, auth, pGetUser} = zoe.initAppAndAuthoriseUser()
//     const eRef = getElementRefs()
//     window.eRef = eRef // good for debug
    
//     pGetUser.then((user) => {
//         if (!user) {
//             zoe.redirBackToLogin()
//             return
//         }
        
//         console.log('user logged in, load the invite details', user)

//         zoe.getUserInvite(db, user, "Zoé Experience July").then((inviteDoc) => {
//             if (!inviteDoc) {
//                 console.log("no user invites")
//                 // go to no-invite tab
//                 eRef.tabs.inviteFlow.noInvitations.click()
//                 eRef.hideLoaderButton.click()
//             }
//             else {
//                 const inviteId = inviteDoc.ref.id
//                 const inviteData = inviteDoc.data()
//                 console.log('invitations for user', inviteData)

//                 gotoCorrectRsvpTab(eRef.tabs.rsvp, inviteData)
//                 hookupElements(eRef, inviteData, db, inviteId)

//                 // show the invite 💪
//                 eRef.tabs.inviteFlow.invite.click()
//                 eRef.hideLoaderButton.click()
//             }
//         })
//         .catch((err) => {
//             console.log('error', err)
//         })
//     })
// })