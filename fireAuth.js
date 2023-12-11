const {onAuthStateChanged, getAuth} = require("firebase/auth");
const {patchTabSwitch, insertCss} = require("./utils");
const {setUser, getFirebaseConfig, getAppRoot, getOffline, getTheme} = require("./actions");
const {initializeApp} = require("firebase/app");
const $ = require("jquery");

window.app = undefined
window.auth = undefined

$(async () => {
    const firebaseConfig = await getFirebaseConfig()
    window.app = initializeApp(firebaseConfig)
    window.auth = getAuth(app)

    const LoginManager = require("./LoginManager")

    onAuthStateChanged(auth, async (user) => {
        if (window.LM === undefined) {
            const isOffline = await getOffline()
            window.LM = new LoginManager({isOffline})
        }

        if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
            console.log('signed in', user)

            const {uid, displayName, email, isAnonymous} = user
            const idToken = await user.getIdToken(true)
            // if (idToken === user.accessToken) {
            //     console.log('Tokens are same')
            // } else {
            //     console.warn('NEW TOKEN', {idToken})
            //     console.log('Auth state changed:', user)
            // }

            const bsUser = {uid, displayName, email, isAnonymous, idToken}
            console.log('fetching custom token')
            const customTokenResp = await fetch(firebaseConfig.authTokenUrl, {
                headers: {'Authorization': 'Bearer ' + idToken}
            })
            if (customTokenResp.ok) {
                const {token: customToken} = await customTokenResp.json()
                bsUser.customToken = customToken
                console.log('custom token success', customToken)
            } else {
                console.error('Error getting custom token', customTokenResp)
            }

            console.log('setting store user', bsUser)
            setUser(bsUser)
            console.log('user set in store')
            window.close()
        } else {
            // User is signed out
            await LM.restoreUser()
        }
    })
})

$(patchTabSwitch)
$(async () => {
    insertCss(await getAppRoot(), await getTheme())
    // $("link[label='theme']").attr('href', `./assets/css/themes/${theme}.css`)
})

const {ipcRenderer} = require("electron");
$("#registerBtn").on("click", async function() {
    await ipcRenderer.invoke('redirecttosite');
    await LM.handleAnonymousSignIn();
})