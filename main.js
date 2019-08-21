const { resolve, basename } = require('path');
const { app, Tray, Menu, dialog } = require('electron');
const Store = require('electron-store');
let tray = null;

const schema = {
    projects: {
        type: 'string'
    }
}

const store = new Store({ schema });

app.on('ready', () => {
    tray = new Tray(resolve(__dirname, 'assets', 'iconWhiteTemplate.png'));
    const storedProjects = store.get('projects');
    const projects = storedProjects ? JSON.parse(storedProjects) : [];

    console.log(projects);

    const contextMenu = Menu.buildFromTemplate([
        {label: 'Item1', type: 'radio', checked: true, click: () => {
            const [ path ] = dialog.showOpenDialog({properties: ['openDirectory']});

            store.set('projects', JSON.stringify([...projects, {
                path,
                name: basename(path),
            }]));
        }}
    ]);
    
    tray.setContextMenu(contextMenu);
});


