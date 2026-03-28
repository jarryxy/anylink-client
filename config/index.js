module.exports = {
  build: {
    DisableF12: true
  },
  dev: {
    removeElectronJunk: true,
    chineseLog: false,
    port: 9080,
    ESLintoptions: {
      formatter: require('eslint-friendly-formatter')
    },
    cssSourceMap: true
  },
  DllFolder: '',
}
