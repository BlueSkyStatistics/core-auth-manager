const { ipcRenderer } = require('electron');

const getUser = async () => {
    // return await ipcRenderer.invoke('bsevent', {event: 'authGetUser'})
    // const user = await ipcRenderer.invoke('authGetUser', {event: 'authGetUser'})
    const user = await ipcRenderer.invoke('getStoreValue', {
        key: 'user',
        storeName: 'store',
        defaultValue: null
    })
    console.log('getStoreValue, user', user)
    return user
}

const setUser = userData => {
    ipcRenderer.send('bsevent', {event: 'authSetUser', data: userData})
}

const deleteUser = () => {
    ipcRenderer.send("bsevent", {'event': 'authDeleteUser'})
}

const getFirebaseConfig = async () => {
    return await ipcRenderer.invoke('getStoreValue', {
        key: 'firebaseConfig',
        storeName: 'sessionStore',
        defaultValue: {}
    })
}

const showWindow = () => {
    ipcRenderer.send("bsevent", {'event': 'setAuthWindowVisible', data: true})
}

const getAppRoot = async () => await ipcRenderer.invoke('getStoreValue', {
    key: 'appRoot',
    storeName: 'sessionStore',
    defaultValue: './'
})

const getTheme = async () => await ipcRenderer.invoke('getStoreValue', {
    key: 'uitheme',
    storeName: 'store',
    defaultValue: 'default-theme'
})

const getOffline = async () => await ipcRenderer.invoke('getStoreValue', {
    key: 'offline',
    storeName: 'configStore',
    defaultValue: false
})

module.exports = {
    getUser,
    setUser,
    deleteUser,
    getFirebaseConfig,
    showWindow,
    getAppRoot,
    getTheme,
    getOffline,
}