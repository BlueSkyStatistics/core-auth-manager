const { BrowserWindow } = require('@electron/remote')
const {getPath} = require("./utils");
const {ipcRenderer} = require("electron");

let authWindow;

const init = ({global}) => {
    const userMenu = global.$(`
        <div class="float-right btn-group m-0 unselectable" id="userMenu">
            <button type="button" class="btn btn-secondary output-control p-0 m-0 small-label mr-3"
                    style="-webkit-app-region: no-drag;">
                <span class="material-icons md-14 mt-1">account_circle</span> <span id="displayName"></span>
            </button>
            <button type="button" class="btn btn-secondary p-0 m-0 small-label mr-3"
                    style="-webkit-app-region: no-drag;" id="logOut">
                <span class="material-icons md-14 mt-1">logout</span>
            </button>
        </div>
    `)
    userMenu.find('button#logOut').on('click', () => {
        store.delete('user')
        show()
    })
    global.$(() => {
        global.$('#header').append(userMenu)
        const {displayName, email} = store.get('user')
        global.$('#userMenu').find('#displayName').text(displayName || email)
    })

    ipcRenderer.on('authSetUser', (event, argument) => {
        ipcRenderer.invoke('setStoreValue', {
            key: 'user',
            storeName: 'store',
            value: argument
        })
        const {displayName, email} = argument
        global.$('#userMenu').find('#displayName').text(displayName || email)
    })

    ipcRenderer.on('authDeleteUser', (event, argument) => {
        console.log('deleting user')
        return global.store.delete('user')
    })

    ipcRenderer.on('setAuthWindowVisible', (event, argument) => {
        console.log('arg', argument)
        argument ? authWindow.show() : authWindow.hide()
    })



    ipcRenderer.on('switchMainVisibility', (event, argument) => {
        console.log('Switch', argument)
        // if (argument.isVisible) {
        //     ipcRenderer.send('bsevent', {event: 'notify', data: {message: 'AUTH WINDOW OPEN'}})
        // } else {
        //     ipcRenderer.send('bsevent', {event: 'notify', data: {message: 'AUTH WINDOW CLOSED'}})
        // }
        ipcRenderer.send('setMainWindowVisible', !argument.isVisible)
    })

    show()
}

const show = () => {
    ipcRenderer.send('setMainWindowVisible', false)
    if (authWindow === undefined || authWindow?.isDestroyed()) {
        authWindow = new BrowserWindow({
            width: 400, height: 600, center: true, transparent: false, frame: false, alwaysOnTop: true,
            show: false,
            // parent: global.mainWindow, modal: true,
            webPreferences: { nodeIntegration: true, contextIsolation: false, enableRemoteModule: true }
        })
        authWindow.on('show', () => {
            ipcRenderer.send('bsevent', {event: 'switchMainVisibility', data: {isVisible: true}})
        })
        authWindow.on('hide', () => {
            ipcRenderer.send('bsevent', {event: 'switchMainVisibility', data: {isVisible: false}})
        })
        authWindow.on('close', () => {
            ipcRenderer.send('bsevent', {event: 'switchMainVisibility', data: {isVisible: false}})
        })
        authWindow.loadFile(getPath('index.html'))
    } else {
        authWindow.show()
    }
    // Open DevTools
    global.sessionStore.get('appMode') === 'test' && authWindow.webContents.openDevTools()

}

const hide = () => {
    authWindow?.close()
}



module.exports = {
    AuthManagerShow: show,
    AuthManagerHide: hide,
    init
}
