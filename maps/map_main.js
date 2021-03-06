module.exports = {
  cache: {},
  load: function (a) {
    this.cache[a] = require('./' + a + '.json').map;
    console.log(a + ' loaded');
  },
  clear: function () {
    for(a in this.cache) {
      delete this.cache[a];
    }
    console.log('Cleared map cache');
  },
  get: function (a) {
    return this.cache[a];
  }
}
