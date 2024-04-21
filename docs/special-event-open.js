


const getElementRefs = () => {
    return {
        hideLoaderButton: $('#hide-loader-button').get(0), // get 0 is because of jqurey / webflow 🤷‍♂️

        // RSVP elements
        openTypeformButton: $('#invite-rsvp-yes-button'),

        tabs: {
            inviteFlow: {
                invite: $('#invite-tab-invite'),
                noInvitations: $('#invite-tab-no-invitations'),
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


const connectTypeformButton = (elementsRef)=> {

    const regForm = createRegistrationform({
        token: window.zoeTypeformToken,
        hidden: { 
            ...zoe.urlParams,
        }, 
    })

    elementsRef.openTypeformButton.on("click", async () => { 
        regForm.toggle()
    })
}




// ============================
//       flow starts here
// ============================


var Webflow = window.Webflow || [];
Webflow.push(async function () {

    const elementsRef = getElementRefs()

    connectTypeformButton(elementsRef)


    elementsRef.tabs.inviteFlow.invite.click()
    elementsRef.hideLoaderButton.click()
})
