const {getPath} = require("./utils");
const {ipcRenderer} = require("electron");

let authWindow;

const init = ({global}) => {
    const userMenu = global.$(`
        <div class="btn-group unselectable m-0 mr-2" id="userMenu">
                <button class="dropdown-toggle btn btn-secondary d-flex align-items-center p-0 m-0" 
                    id="userMenu_dropdown" 
                    style="-webkit-app-region: no-drag;"
                    data-target="userMenu_dropdown_items" 
                    type="button" data-toggle="dropdown" 
                    aria-haspopup="true" aria-expanded="false"
                >
                    <span class="btn-top-menu mx-1" id="displayName">Log In</span>
                </button>
                <div 
                    class="dropdown-menu tab-content-black" 
                    id="userMenu_dropdown_items" 
                    aria-labelledby="userMenu_dropdown"
                >
                        <button 
                            class="btn btn-secondary btn-top-menu btn-chapter text-white text-left mt-0 mb-0 pt-0 pb-0 pr-1 w-100" 
                            style="-webkit-app-region: no-drag;"
                            id="logOut"
                        >
                            <i class="material-icons md-14">login</i>
                            <span>Log In</span>
                        </button>
                </div>
        </div>
    `)
    userMenu.find('button#logOut').on('click', () => {
        sessionStore.delete('userSubscriptions')
        store.delete('user')
        show()
    })

    ipcRenderer.on('init-done', (event, argument) => {
        global.$(() => {
            global.$('#account-box').append(userMenu)
        })
        if (store.get('user') !== undefined && ! store.get('user').isAnonymous) {
            global.$('#userMenu').find('#displayName').text(store.get('user').displayName || store.get('user').email)
            global.$('#userMenu').find('#userMenu_dropdown_items > button > span').text('Log Out')
            global.$('#userMenu').find('#userMenu_dropdown_items > button > i.material-icons').text('logout')
        }
    })

    ipcRenderer.on('authSetUser', (event, argument) => {
        ipcRenderer.invoke('setStoreValue', {
            key: 'user',
            storeName: 'store',
            value: argument
        }).then(() => {
            PM.getUpdateMeta(true).then(async () => {
                await resumeAppLoad()
            })
        })
        const {displayName, email} = argument
        global.$('#userMenu').find('#displayName').text(displayName || email)
    })

    ipcRenderer.on('authDeleteUser', (event, argument) => {
        console.log('deleting user')
        // global.sessionStore.delete('userSubscriptions')
        return global?.store?.delete('user') || store?.delete('user')
    })

    ipcRenderer.on('setAuthWindowVisible', (event, argument) => {
        // console.log('arg', argument)
        argument ? authWindow.show() : authWindow.hide()
    })


    ipcRenderer.on('switchMainVisibility', (event, argument) => {
        // console.log('Switch', argument)
        if (argument.isVisible) {
            // ipcRenderer.send('bsevent', {event: 'notify', data: {message: 'AUTH WINDOW OPEN'}})
        } else {
            // ipcRenderer.send('bsevent', {event: 'notify', data: {message: 'AUTH WINDOW CLOSED'}})
            const {displayName, email, isAnonymous} = store.get('user', {})
            // global.window.console.log('HIDE', store.get('user', {}))
            const dropdownText = isAnonymous ? 'Log In' : displayName || email
            global.$('#userMenu').find('#userMenu_dropdown > i').css('display', isAnonymous ? 'initial' : 'none')
            global.$('#userMenu').find('#userMenu_dropdown_items > button > span').text(isAnonymous ? 'Log In' : 'Log Out')
            global.$('#userMenu').find('#userMenu_dropdown_items > button').attr('disabled', !!store.get('offline'))
            global.$('#userMenu').find('#userMenu_dropdown_items > button > i.material-icons').text(isAnonymous ? 'login' : 'logout')
            global.$('#userMenu').find('#displayName').text(dropdownText)
        }
        ipcRenderer.send('setMainWindowVisible', !argument.isVisible)
    })

    show()
}

const show = () => {
    ipcRenderer.send('setMainWindowVisible', false)
    if (authWindow === undefined || authWindow?.isDestroyed()) {
        authWindow = new global.RemoteBrowserWindow({
            width: 550, height: 400, center: true, transparent: false, frame: false, alwaysOnTop: true,
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
