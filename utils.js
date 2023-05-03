const $ = require("jquery");
const path = require("path");

const getInputProxy = selector => {
    const proxyHandler = {
        get(target, prop, receiver) {
            switch (prop) {
                case '':
                case 'value':
                case 'text':
                    return target.val()
                default:
                    return Reflect.get(...arguments)
            }
        },
        set(obj, prop, value) {
            switch (prop) {
                case '':
                case 'value':
                case 'text':
                    return obj.val(value)
                default:
                    return Reflect.set(...arguments)
            }
        },
    }
    return new Proxy($(selector), proxyHandler)
}

const getDivProxy = selector => {
    const proxyHandler = {
        get(target, prop, receiver) {
            switch (prop) {
                case '':
                case 'value':
                case 'text':
                    return target.text()
                default:
                    return Reflect.get(...arguments)
            }
        },
        set(obj, prop, value) {
            switch (prop) {
                case '':
                case 'value':
                case 'text':
                    return obj.text(value)
                default:
                    return Reflect.set(...arguments)
            }
        },
    }
    return new Proxy($(selector), proxyHandler)
}

const patchTabSwitch = () => {
    $('#loginForm a[data-toggle="tab"]').on('shown.bs.tab', function (event) {
        event.target.classList.remove('active')
        $('#loginForm h5.modal-title').text(event.target.dataset.header)
    })
}

const getPath = relativePath => {
    return path.normalize(path.join(__dirname, relativePath))
}

const insertCss = (appRoot, theme = 'default-theme') => {
    console.log('insertcss', appRoot, theme)
    const path = require('path')
    const stylesheets = [
        'assets/vendor/fontawesome/css/fontawesome.css',
        'assets/vendor/fontawesome/css/solid.css',
        'assets/vendor/fontawesome/css/regular.css',
        'assets/vendor/fontawesome/css/brands.css',
        'assets/vendor/bootstrap-select/bootstrap-select.min.css',
        'assets/vendor/material/material.css',
        'assets/css/custom.css',
        'assets/css/buttons.css',
        'assets/css/elements.css',
        'assets/css/forms.css',
        'assets/css/lightable.css',
        `assets/css/themes/${theme}.css`
    ]
    const makeLinkHref = pth => path.normalize(path.join(appRoot, pth))
    const makeLinkEl = (pth, attrs = {}) => {
        const el = document.createElement('link')
        const allAttrs = {
            rel: 'stylesheet',
            href: makeLinkHref(pth),
            ...attrs
        }
        Object.assign(el, allAttrs)
        return el
    }

    const html = stylesheets.map(pth => makeLinkEl(pth))
    $('head').prepend(...html)
}

module.exports = {
    getInputProxy,
    getDivProxy,
    patchTabSwitch,
    getPath,
    insertCss
}