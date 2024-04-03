
  // Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCKvPDbY5a2poNMuod5LHC1lKhq-4dHIKo",
  authDomain: "zoe-garden-app.firebaseapp.com",
  projectId: "zoe-garden-app",
  storageBucket: "zoe-garden-app.appspot.com",
  messagingSenderId: "1086683960656",
  appId: "1:1086683960656:web:b2b48ba55019fd5f268855",
  measurementId: "G-ZQXCW40B65"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// FirebaseUI config.
var uiConfig = {
  signInOptions: [
  {
    callbacks: {
      signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        return false;
      },
    },
    provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
    defaultCountry: 'NL',
    // Invisible reCAPTCHA with image challenge and bottom left badge.
    recaptchaParameters: {
      type: 'image',
      size: 'invisible',
      badge: 'bottomleft'
    }
  },
  ],
  tosUrl: 'https://uploads-ssl.webflow.com/6405f2e46eec1ba34c00d5a4/6412dc5e358366816462ebcb_Zoe%20-%20Terms%20and%20Conditions.pdf',
  privacyPolicyUrl: 'https://uploads-ssl.webflow.com/6405f2e46eec1ba34c00d5a4/6412e098f4e60db3c457d909_Zoe%20-%20Privacy%20Policy.pdf'
};

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());





  // ============================
  //       flow starts here
  // ============================



var Webflow = window.Webflow || [];
Webflow.push(function () {

  //  Track user login status , Update UI element upon changes on login state
  firebase.auth().onAuthStateChanged(async (user) => {

    if (user) {
      let isNewUser = (user.metadata.lastLoginAt - user.metadata.createdAt) < 1000

      if (isNewUser)
        await zoe.waitForUserProfile(db, user)


      let urlParams = simpleQueryString.parse(location.href)
      let redirTo = urlParams.redir || "/app/dashboard"
      console.log("user logged in, redir to", redirTo)

      location.href = redirTo
    } 
    else {
      console.log("no logged in user, stay to allow them to login")
      ui.start('#firebaseui-auth-container', uiConfig)
    }
  });
});
