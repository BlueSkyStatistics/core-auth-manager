const {onAuthStateChanged, getAuth} = require("firebase/auth");
const {getDivProxy, patchTabSwitch, insertCss} = require("./utils");
const {setUser, getFirebaseConfig, getUser, getAppRoot} = require("./actions");
const {initializeApp} = require("firebase/app");
const $ = require("jquery");
// const LoginManager = require("./LoginManager");

window.app = undefined
window.auth = undefined



$(async () => {
    const firebaseConfig = await getFirebaseConfig()
    window.app = initializeApp(firebaseConfig)
    window.auth = getAuth(app)

    const LoginManager = require("./LoginManager");


    onAuthStateChanged(auth, async (user) => {
        if (window.LM === undefined) {
            window.LM = new LoginManager()
        }

        // const loggedInUserProxy = getDivProxy('#loggedInUser')

        if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
            console.log('signed in', user)
            // loggedInUserProxy.text = `Hi, ${user.displayName}! You are logged in`

            const {uid, displayName, email, isAnonymous} = user
            const bsUser = {uid, displayName, email, isAnonymous}
            // if (user.isAnonymous) {
            //     bsUser.displayName = 'Anonymous'
            //     bsUser.email = ''
            // } else {
                const tokenUrl = firebaseConfig.authTokenUrl
                console.log('fetching custom token')
                const customTokenResp = await fetch(tokenUrl, {
                    method: 'POST',
                    headers: {'content-type': 'application/json'},
                    body: JSON.stringify({uid: user.uid})
                })
                if (customTokenResp.ok) {
                    const {token: customToken} = await customTokenResp.json()
                    bsUser.customToken = customToken
                    console.log('custom token success', customToken)
                } else {
                    console.error('Error getting custom token', customTokenResp)
                }
            // }
            console.log('setting store user', bsUser)
            setUser(bsUser)
            console.log('user set in store')
            window.close()



            // const {getFirestore, collection, query, where, getDocs} = require("firebase/firestore")
            // const db = getFirestore(app)
            // const modulesRef = collection(db, "modules")

            // Create a query against the collection.
            // const q = await getDocs(modulesRef)
            // console.log('modules q', q)
        } else {
            // User is signed out
            // ...
            // console.log('signed out')
            // store.delete('user')
            // loggedInUserProxy.text = 'Sign in'
            await LM.restoreUser()
        }
    })
})

$(patchTabSwitch)
$(async () => {
    // sessionStore.get("appRoot")
    insertCss(await getAppRoot())
})
