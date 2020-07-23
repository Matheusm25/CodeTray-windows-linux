const { resolve, basename } = require('path');
const {
  app,
  Tray,
  Menu,
  dialog,
  MenuItem,
  BrowserWindow,
} = require('electron');
const Store = require('electron-store');
const spawn = require('cross-spawn');
const prompt = require('electron-prompt');

const tray = null;
const fs = require('fs');

const schema = {
  projects: {
    type: 'string',
  },
};

let mainTray = {};
let browserWindowToSuport;

const store = new Store({ schema });

function render(tray = mainTray) {
  const storedProjects = store.get('projects');
  const projects = storedProjects ? JSON.parse(storedProjects) : [];

  const items = projects.map(({ name, path }) => ({
    label: name,
    submenu: [
      {
        label: 'Abri no VSCode',
        click: () => {
          spawn('code', [path]);
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
      click: async () => {
        const result = dialog.showOpenDialog({ properties: ['openDirectory'] });

        const projectName = await prompt({
          title: 'Project name',
          label: 'Project name:',
          inputAttrs: {
            type: 'text',
          },
          type: 'input',
          height: 180,
        }, browserWindowToSuport);

        if (!result) return;

        const [path] = result;
        const name = basename(path);

        store.set(
          'projects',
          JSON.stringify([
            ...projects,
            {
              path,
              name: projectName,
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
  browserWindowToSuport = new BrowserWindow({ show: false });
  mainTray = new Tray(resolve(__dirname, 'assets', 'iconWhiteTemplate.png'));
  render(mainTray);
});
