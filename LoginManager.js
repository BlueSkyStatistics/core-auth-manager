const $ = require('jquery')
// const {initializeApp} = require("firebase/app");
const {
    // getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    // onAuthStateChanged,
    signOut,
    signInWithCustomToken,
    // signInWithCredential,
    // signInAnonymously,
    // connectAuthEmulator
} = require("firebase/auth")


const {getInputProxy, getDivProxy} = require("./utils");
const {getUser, deleteUser, showWindow, setUser} = require("./actions");




class LoginManager {
    constructor() {
        $('#loginSubmit').on('click', this.handleSignIn)
        $('#anonymousSignIn').on('click', this.handleAnonymousSignIn)
        $('#closeBtn').on('click', this.handleAnonymousSignIn)
        console.log('LoginManager init')
        window.LM = this
    }

    inputs = {
        email: getInputProxy('#loginEmail'),
        password: getInputProxy('#loginPassword'),
    }
    errorFields = {
        email: getDivProxy('#loginEmailError'),
        password: getDivProxy('#loginPasswordError'),
        loginAll: getDivProxy('#loginAllError')
    }
    setError = (field, message) => {
        if (this.errorFields[field]) {
            this.errorFields[field].value = message
        }
    }
    clearErrors = () => {
        Object.values(this.errorFields).forEach(i => i.value = '')
    }
    handleSignInError = error => {
        const {code, message} = error
        switch (code) {
            case 'auth/invalid-email':
                this.setError('email', message)
                break
            case 'auth/wrong-password':
                this.setError('password', message)
                break
            default:
                console.warn(error)
                this.setError('loginAll', message)
        }
    }
    handleSignUpError = error => console.warn(error)

    handleSignIn = async () => {
        this.clearErrors()
        const {email, password} = this.inputs
        console.log('logging in with:', email.value, password.value)
        try {
            await signInWithEmailAndPassword(auth, email.value, password.value)
        } catch (e) {
            this.handleSignInError(e)
        }
    }
    handleAnonymousSignIn = async () => {
        this.clearErrors()
        console.log('logging in anonymously')
        try {
            // await signInAnonymously(auth)
            const bsUser = {uid: '', displayName: '', email: '', isAnonymous: true}
            console.log('setting store user', bsUser)
            setUser(bsUser)
            console.log('user set in store')
            window.close()
        } catch (e) {
            this.handleSignInError(e)
        }

    }
    signUpEmail = async (email, password) => {
        try {
            await createUserWithEmailAndPassword(auth, email, password)
        } catch (e) {
            this.handleSignUpError(e)
        }
    }

    restoreUser = async () => {
        const user = await getUser()
        if (user !== undefined && user !== null) {
            try {
                if (user.isAnonymous) {
                    await this.handleAnonymousSignIn()
                } else {
                    await signInWithCustomToken(auth, user.customToken)
                }
            } catch (e) {
                showWindow()
                this.handleSignInError(e)
            }
        } else {
            showWindow()
        }
    }

    handleSignOut = async () => {
        // this.store.delete('user')
        deleteUser()
        await signOut(auth)
        console.log('user deleted from store')
    }
}





module.exports = LoginManager