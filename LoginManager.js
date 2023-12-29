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
const {ipcRenderer} = require("electron");
const freeOfflineHours = 0


class LoginManager {
    constructor({isOffline}) {
        console.log('LoginManager init')
        $('#loginSubmit').on('click', this.handleSignIn)
        $('#anonymousSignIn').on('click', this.handleAnonymousSignIn)
        $('#closeBtn').on('click', this.handleAnonymousSignIn)
        this.isOffline = isOffline
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
            case 'auth/invalid-custom-token':
                this.setError('loginAll', message)
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
            const bsUser = {uid: '', displayName: '', email: '', isAnonymous: true, lastLogin: new Date().getTime()}
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
        switch (this.isOffline) {
            case false:
                if (user !== undefined && user !== null) {
                    try {
                        if (user.isAnonymous) {
                            await this.handleAnonymousSignIn()
                        } else {
                            // verify token here
                            // after sign-in check if expired and probably refresh
                            // https://stackoverflow.com/questions/49287144/firebase-auth-admin-custom-tokens-cannot-be-refreshed-after-one-hour
                            // https://firebase.google.com/docs/reference/rest/auth
                            await signInWithCustomToken(auth, user.customToken)
                        }
                    } catch (e) {
                        showWindow()
                        this.handleSignInError(e)
                    }
                } else {
                    showWindow()
                }
                break
            case true:
            default:
                if (user !== undefined && user !== null) {
                    if (user.lastLogin && !user.isAnonymous) {
                        // new BSEvent('notify').emit('here')
                        const deltaHours = (new Date() - user.lastLogin) / 36e5
                        if (deltaHours > freeOfflineHours) {
                            // await this.handleAnonymousSignIn()
                            ipcRenderer.send('bsevent', {
                                event: 'notify', data: {
                                    timer: false,
                                    title: 'Offline warning',
                                    message: 'You have been logged out',
                                    type: 'warning'
                                }})
                            await this.handleSignOut()
                            // showWindow()
                            await this.handleAnonymousSignIn()
                            return
                        } else {
                            ipcRenderer.send('bsevent', {
                                event: 'notify', data: {
                                    timer: false,
                                    title: 'Offline warning',
                                    message: `You will be logged out after ${(freeOfflineHours - deltaHours).toFixed(1)} hours if you continue using application in offline mode`,
                                    type: 'warning'
                                }
                            })
                        }
                    } else {
                        user.lastLogin = new Date().getTime()
                    }
                    setUser(user)
                    window.close()
                } else {
                    await this.handleAnonymousSignIn()
                }

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