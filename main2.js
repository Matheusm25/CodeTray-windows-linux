const { resolve, basename } = require('path');
const { app, Tray, Menu, dialog, MenuItem } = require('electron');
const Store = require('electron-store');
const spawn = require('cross-spawn');
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
    
    const items = projects.map((project) => {
        return {label: project.name, click: () => spawn.sync('code', [project.path])};
    });

    const contextMenu = Menu.buildFromTemplate([
        ...items,
        {
            type: 'separator',
        },
    ]);

    contextMenu.append(new MenuItem({
        label: 'Adicionar pasta', 
        type: 'radio', 
        checked: true, 
        click: () => {
            const [ path ] = dialog.showOpenDialog({properties: ['openDirectory']});
            const name = basename(path);

            store.set('projects', JSON.stringify([...projects, {
                path,
                name,
            }]));

            const item = new MenuItem({ label: name, click: () => spawn.sync('code', path)});
            
            contextMenu.append(item);
        }
    }));
    
    tray.setToolTip('Code Tray');
    tray.on('click', () => {
        tray.popUpContextMenu(contextMenu);
    });
    tray.setContextMenu(contextMenu);
});


