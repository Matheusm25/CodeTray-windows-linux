const { resolve, basename } = require('path');
const { app, Tray, Menu, dialog, MenuItem } = require('electron');
const Store = require('electron-store');
const spawn = require('cross-spawn');
const { exec } = require('child_process');

let tray = null;
const fs = require('fs');

const schema = {
    projects: {
        type: 'string'
    }
}

let mainTray = {};

const store = new Store({ schema });

function render(tray = mainTray) {
    const storedProjects = store.get('projects');
    const projects = storedProjects ? JSON.parse(storedProjects) : [];

    const items = projects.map(( { name, path } ) => ({
        label: name,
        submenu: [
            {
                label: 'Abrir no VSCode',
                click: () => {
                    spawn('code', [path]);
                },
            },
            {
                label: 'Abrir no terminal',
                click: () => {
                    exec('gnome-terminal --working-directory="' + [path] + '"');
                },
            },
            {
                label: 'Abrir no Explorer',
                click: () => {
                    var x = exec('nemo ' + [path])
                },
            },
            {
                label: 'Remover',
                click: () => {
                    store.set('projects', JSON.stringify(projects.filter(item => item.path !== path)));
                    render();
                },
            },
        ],
    }));

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Adicionar novo projeto...',
            click: () => {
                const result = dialog.showOpenDialog({ properties: [ 'openDirectory']});

                if (!result) return;

                const [ path ] = result;
                const name = basename(path);

                store.set(
                    'projects',
                    JSON.stringify([
                        ...projects,
                        {
                            path,
                            name,
                        },
                    ]),
                );

                render();
            },
        },
        {
            type: 'separator',
        },
        ...items,
        {
            type: 'separator',
        },
        {
            type: 'normal',
            label: 'Fechar Code Tray',
            role: 'quit',
            enabled: true,
        },
    ]);

    tray.setContextMenu(contextMenu);
    tray.on('click', tray.popUpContextMenu);
}

app.on('ready', () => {
    mainTray = new Tray(resolve(__dirname, 'assets', 'iconWhiteTemplate.png'));

    render(mainTray);
});