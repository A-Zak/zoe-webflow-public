


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



const hookupRsvpButtons = (elementsRef, profile, eventId)=> {

    const regForm = createRegistrationform({
        token: "O880cuug", // experience registration
        hidden: { 
            firstName: profile.public.firstName,
            lastName: profile.public.lastName,
        }, 
        onDoneCallback: async () => {
            console.log("tf done callback")
            await zoe.api.setRsvp({
                eventId: eventId, 
                rsvp: "interested"
            })
            elementsRef.tabs.rsvp.yes.click()
            // TODO: close form (?). don't have to, there's a finish screen.
            //       after they close it, the screen behind it has updated 💪
            //       downside is that they don't imediately see the add to 
            //       calendar button... 🤷‍♂️
        }
    })


    elementsRef.inviteRsvpYesButton.on("click", async () => { 
        await zoe.api.setRsvp({
            eventId: eventId, 
            rsvp: "interested"
        })
        // elementsRef.tabs.rsvp.yes.click()
        regForm.toggle()
        // updateRSVP(db, inviteId, "YES", () => {
        //     elementsRef.tabs.rsvp.yes.click()
        //     regForm.toggle()
        // }) 
    })

    elementsRef.inviteRsvpNoButton.on("click", async () => { 
        await zoe.api.setRsvp({
            eventId: eventId, 
            rsvp: "no"
        })
        elementsRef.tabs.rsvp.no.click()
        // updateRSVP(db, inviteId, "NO", () => {
        //     elementsRef.tabs.rsvp.no.click()
        // }) 
    })

    elementsRef.inviteRsvpChangeButton1.on("click", () => elementsRef.tabs.rsvp.toAnswer.click())
    elementsRef.inviteRsvpChangeButton2.on("click", () => elementsRef.tabs.rsvp.toAnswer.click())
}




const hookupElements = (elementsRef, eventDetails, profile, eventId) => {
    
    // update invitee name(s)
    elementsRef.inviteFirstName1.text(profile.public.firstName)
    elementsRef.inviteFirstName2.text(profile.public.firstName)

    hookupRsvpButtons(elementsRef, profile, eventId)
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
    // window.elementsRef = elementsRef // good for debug


    let eventId = "YV9FfZBzYNULABhtQimT" // YOKO Connect event id
    let eventDetails = (await zoe.api.getEventDetails({eventId})).data
    

    if (!eventDetails || eventDetails.error) {
        // redir back to dashboard
        location.href = '/'
        return
    }
    
    // make sure user is allowed to see the invite
    if (zoe.hasVisibilityPermission(eventDetails, profile)) {
        elementsRef.tabs.inviteFlow.invite.click()
    }
    else {
        elementsRef.tabs.inviteFlow.noInvitations.click()
    }


    console.log("eventDetails", eventDetails.event)
    console.log("profile", profile)
    hookupElements(elementsRef, eventDetails.event, profile, eventId)

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
