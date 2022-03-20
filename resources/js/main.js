function getCredentials() {
    return new Promise((resolve, reject) => {
        let usernamePromise = Neutralino.storage.getData("username");
        let passwordPromise = Neutralino.storage.getData("password");
        Promise
            .all([usernamePromise,  passwordPromise])
            .then(results => resolve(
                {
                    username: results[0],
                    password: results[1]
                }
            ))
            .catch(reject);
    });
}

function loadCredentials() {    
    getCredentials()
    .then(credentials => {
        document.getElementById('loginuserid').value = decodeURIComponent(credentials.username);
        document.getElementById('loginpassword').value = decodeURIComponent(credentials.password);
    })
    .catch(() => {
        document.getElementById('loginuserid').value = "";
        document.getElementById('loginpassword').value = "";
    });
}

function setCredentials(credentials) {
    return new Promise((resolve, reject) => {
        let usernamePromise = Neutralino.storage.setData("username", credentials.username);
        let passwordPromise = Neutralino.storage.setData("password", credentials.password);
        Promise
            .all([usernamePromise, passwordPromise])
            .then(resolve)
            .catch(reject);
    });
}
loadCredentials();

document.getElementById('save').onclick = () => {
    setCredentials({
        username: encodeURIComponent(document.getElementById('loginuserid').value),
        password: encodeURIComponent(document.getElementById('loginpassword').value)
    })
}

function setTray() {
    if(NL_MODE != "window") {
        console.log("INFO: Tray menu is only available in the window mode.");
        return;
    }
    let tray = {
        icon: "/resources/icons/trayIcon.png",
        menuItems: [
            {id: "SHOW", text: "Show login credentials"}, 
            {id: "SEP", text: "-"},
            {id: "QUIT", text: "Quit"}
        ]
    };
    Neutralino.os.setTray(tray);
}

function onTrayMenuItemClicked(event) {
    switch(event.detail.id) {
        case "SHOW":
            loadCredentials();
            Neutralino.window.show();
            break;
        case "QUIT":
            Neutralino.app.exit();
            break;
    }
}

function onWindowClose() {
    Neutralino.window.hide()
        .then(() => Neutralino.os.showNotification("App running in background", "The app will continue to run in the background until you exit it from the tray icon", "INFO"))
}

Neutralino.init();

Neutralino.events.on("trayMenuItemClicked", onTrayMenuItemClicked);
Neutralino.events.on("windowClose", onWindowClose);

if(NL_OS != "Darwin") { // TODO: Fix https://github.com/neutralinojs/neutralinojs/issues/615
    setTray();
}
