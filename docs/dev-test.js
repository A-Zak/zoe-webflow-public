
const getElementRefs = () => {
    return {
        hideLoaderButton: $('#hide-loader-button').get(0), // get 0 is for jqurey
    }
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


    // if (!eventDetails || eventDetails.error) {
    //     // redir back to dashboard
    //     location.href = '/app/dashboard'
    //     return
    // }



    // TODO: check if user is member, if not redir / different tab.
    // TODO: check if user invited, if not redir / different tab.



    // TODO: if event is not visibility == "open", and you're not on the invite list, redir to '/app/dashbord'
    // TODO: also if event type is Special event (which should not appear in the app). Alternativly (possibly) add filter in getEventDetails 💪

    console.log("eventDetails", eventDetails.event)
    console.log("profile", profile)
    console.log("This is amazing!!!")


    // elementsRef.hideLoaderButton.click()
})

