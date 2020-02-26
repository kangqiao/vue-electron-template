const os = require('os')
const builder = require('electron-builder')

const Platform = builder.Platform
const { name, productName, version } = require('../package.json')

let targets
var platform = os.platform()

if (platform == 'darwin') {
  targets = Platform.MAC.createTarget()
} else if (platform == 'win32') {
  targets = Platform.WINDOWS.createTarget()
} else if (platform == 'linux') {
  targets = Platform.LINUX.createTarget()
}

let artifactFileName = name + '_Setup_' + version.replace(/\./g, '') + '_' + getyyyyMMdd()

const config = {
  appId: `com.kangqiao.${name}`,
  copyright: 'Copyright ©2019 kangqiao610@gmail.com',
  // asar: false,
  // compression: 'store',
  productName,
  directories: {
    output: './build/',
  },
  publish: [
    {
      provider: "generic",
      url: "http://localhost:2060/zip",
    }
  ],
  files: ['_icons/icon.*', './dist/**/*'],
  dmg: {
    contents: [
      {
        path: '/Applications',
        type: 'link',
        x: 410,
        y: 230,
      },
      {
        type: 'file',
        x: 130,
        y: 230,
      },
    ],
    window: {
      height: 380,
      width: 540,
    },
  },
  linux: {
    icon: '_icons/icon.png',
    target: ['deb', 'snap', 'AppImage'],
  },
  mac: {
    artifactName: artifactFileName+'.${ext}',
    category: 'public.app-category.utilities',
    icon: '_icons/icon.icns',
    target: ['dmg', 'zip'],
    type: 'distribution',
  },
  win: {
    icon: '_icons/icon.ico',
    artifactName: artifactFileName+'.${ext}',
    verifyUpdateCodeSignature: false,
    target: ['nsis', 'zip', 'portable'],
  },
  nsis: {
    allowToChangeInstallationDirectory: true,
    oneClick: false,
  },
}

builder
  .build({
    targets,
    config,
  })
  .then(m => {
    console.log(m)
  })
  .catch(e => {
    console.error(e)
  })

function getyyyyMMdd(){
  let d = new Date()
  let curr_date = d.getDate()
  let curr_month = d.getMonth() + 1
  let curr_year = d.getFullYear()
  String(curr_month).length < 2 ? (curr_month = "0" + curr_month): curr_month
  String(curr_date).length < 2 ? (curr_date = "0" + curr_date): curr_date
  let yyyyMMdd = curr_year + "" + curr_month + "" + curr_date
  return yyyyMMdd
}
