


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
            console.log("tf on ready")
            if (onReadyCallback) onReadyCallback()
        },
        onSubmit: ()=> {
            console.log("tf on submit")
            if (onDoneCallback) onDoneCallback()
        }
    })
}


const hookupRsvpButtons = (elementsRef, profile, eventId)=> {

    const regForm = createRegistrationform({
        token: window.zoeTypeformToken,
        hidden: { 
            firstname: profile.public.firstName,
            lastname: profile.public.lastName,
            phonenumber: profile.auth.phoneNumber,
        }, 
        onDoneCallback: async () => {
            console.log("tf done callback")
            await zoe.api.setRsvp({
                eventId: eventId, 
                rsvp: "yes"
            })
            elementsRef.tabs.rsvp.yes.click()
            // TODO: close form (?). don't have to, there's a finish screen.
            //       after they close it, the screen behind it has updated 💪
            //       downside is that they don't imediately see the add to 
            //       calendar button... 🤷‍♂️
        }
    })


    elementsRef.inviteRsvpYesButton.on("click", async () => { 
        // await zoe.api.setRsvp({
        //     eventId: eventId, 
        //     rsvp: "interested" // rsvp "interested" not supported // TODO: maybe add?
        // })
        regForm.toggle()
    })

    elementsRef.inviteRsvpNoButton.on("click", async () => { 
        await zoe.api.setRsvp({
            eventId: eventId, 
            rsvp: "no"
        })
        elementsRef.tabs.rsvp.no.click()
    })

    elementsRef.inviteRsvpChangeButton1.on("click", () => elementsRef.tabs.rsvp.toAnswer.click())
    elementsRef.inviteRsvpChangeButton2.on("click", () => elementsRef.tabs.rsvp.toAnswer.click())
}


const containsHeb = (str) => {
    return (/[\u0590-\u05FF]/).test(str);
}

const hookupRecommendationInfo = (rData, rElements) => {
    let rSender = rData.senderProfile

    rElements.expandedContainer
            .find('.recommender-name')
            .text(`${rSender.firstName} ${rSender.lastName}`)
    rElements.expandedContainer
            .find('.recommender-pic')
            .attr("src", rSender.profilePic)
    rElements.expandedContainer
            .find('.recommendation-text')
            .text(rData.recommendationText)

    if (containsHeb(rData.recommendationText))
        rElements.expandedContainer
            .find('.recommendation-text')
            .css('text-align', 'right')


    rElements.buttonPic
        .attr("src", rSender.profilePic)
}

// helper to parse recommendators to a nice usable string
const parseRecommenderNames = (recommendations) => {

    let onlyRecommenderNames = _.map(recommendations, (r) => `${r.senderProfile.firstName} ${r.senderProfile.lastName}`)

    if (recommendations.length == 1)
        return onlyRecommenderNames[0]
        
    return _.reduce(onlyRecommenderNames, (allRecommenders, aRecommender, key) => {
        if (key < onlyRecommenderNames.length - 1)
            return `${allRecommenders}, ${aRecommender}`
        else
            return `${allRecommenders} and ${aRecommender}`
    })
}

const hookupRecommendationElements = (eRef, recommendations) => {
    if (recommendations.length > 0) {

        console.log("recommendations in invite: ", recommendations.length)

        let recommendersNamesString = parseRecommenderNames(recommendations)

        if (recommendations.length == 1)
            eRef.recommendationsIntro.text(`We've received a recommendation from one of our valued members, ${recommendersNamesString}, who believes you would be a great fit for our upcoming event.`)
        else {
            let wordNumbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
            eRef.recommendationsIntro.text(`We've received a recommendation from ${wordNumbers[recommendations.length]} of our valued members, ${recommendersNamesString}, who believe you would be a great fit for our upcoming event.`)
        }

        let aRecommendation = recommendations.pop()

        hookupRecommendationInfo(aRecommendation, {
            expandedContainer: eRef.expandedRecommendationContainer,
            buttonPic: eRef.recommendationsImage1
        })

        while (recommendations.length) {
            aRecommendation = recommendations.pop()

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



const hookupElements = (elementsRef, profile, eventId, recommendations) => {
    
    // update invitee name(s)
    elementsRef.inviteFirstName1.text(profile.public.firstName)
    elementsRef.inviteFirstName2.text(profile.public.firstName)

    hookupRsvpButtons(elementsRef, profile, eventId)
    hookupRecommendationElements(elementsRef, recommendations)

    // elementsRef.recommendationsBlock.hide()
}


const gotoCorrectRsvpTab = (rsvpTabs, eventData, profile) => {
    let rsvpTab = rsvpTabs.toAnswer
    if (_.includes(eventData.rsvpYes, profile.auth.phoneNumber))
        rsvpTab = rsvpTabs.yes
    else if (_.includes(eventData.rsvpNo, profile.auth.phoneNumber))
        rsvpTab = rsvpTabs.no

    rsvpTab.click()
}









// ============================
//       flow starts here
// ============================


var Webflow = window.Webflow || [];
Webflow.push(async function () {

    let {profile} = await zoe.initFbApp({baseLoginUrl:"/login-yoko"})

    const elementsRef = getElementRefs()
    // window.elementsRef = elementsRef // good for debug


    let eventId = window.zoeEventId

    let [eventDetailsResult, recommendationsResult] = await Promise.all([
        zoe.api.getEventDetails({eventId}), 
        zoe.api.getRecommendationsForEvent({eventId})
    ])

    let eventDetails = eventDetailsResult.data.event
    let recommendations = recommendationsResult.data.recommendations
    
    
    // make sure user is allowed to see the invite
    if (zoe.hasVisibilityPermission(eventDetails, profile)) {
        elementsRef.tabs.inviteFlow.invite.click()
    }
    else {
        elementsRef.tabs.inviteFlow.noInvitations.click()
    }


    console.log("eventDetails", eventDetails)
    console.log("recommendations", recommendations)
    console.log("profile", profile)

    gotoCorrectRsvpTab(elementsRef.tabs.rsvp, eventDetails, profile)
    hookupElements(elementsRef, profile, eventId, recommendations)

    elementsRef.hideLoaderButton.click()
})




// var Webflow = window.Webflow || [];
// Webflow.push(function () {

//     const {app, db, auth, pGetUser} = zoe.initAppAndAuthoriseUser()
//     const elementsRef = getElementRefs()
//     window.elementsRef = elementsRef // good for debug
    
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
//                 elementsRef.tabs.inviteFlow.noInvitations.click()
//                 elementsRef.hideLoaderButton.click()
//             }
//             else {
//                 const inviteId = inviteDoc.ref.id
//                 const inviteData = inviteDoc.data()
//                 console.log('invitations for user', inviteData)

//                 gotoCorrectRsvpTab(elementsRef.tabs.rsvp, inviteData)
//                 hookupElements(elementsRef, inviteData, db, inviteId)

//                 // show the invite 💪
//                 elementsRef.tabs.inviteFlow.invite.click()
//                 elementsRef.hideLoaderButton.click()
//             }
//         })
//         .catch((err) => {
//             console.log('error', err)
//         })
//     })
// })
