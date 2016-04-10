var util = require('util');
module.exports = {
  init: function () {
    var commands = this.commands;
    console.log('Command line initialized');
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', function (text) {
      text = text.replace('\n', '').split(' ');
      if(text[0] in commands) {
        if(commands[text[0]].parameters.length == text.length - 1) {
          var functionName = text[0];
          delete text[0];
          commands[functionName].call(text);
        } else {
          console.log('Faulty command flags');
        }
      } else {
        console.log('Command \'' + text.toString().replace(/,/g, ' ') + '\' is not found');
      }
      console.log('-----------------------------------------------');
    });

  },
  commands: {
    exit: {
      parameters: [],
      call: function () {
        console.log('Exiting script...');
        process.exit();
      }
    },
    mapCache: {
      parameters: [],
      call: function (flags) {
        console.log(require('./maps/map_main.js').cache);
      }
    },
    loadMap: {
      parameters: [
        'a'
      ],
      call: function (flags) {
        require('./maps/map_main.js').load(flags[1]);
      }
    },
    clear: {
      parameters: [],
      call: function (flags) {
        console.log('\033[2J');
      }
    },
    objects: {
      parameters: [
        'value'
      ],
      call: function (flags) {
        console.log(require('./objects.js')[flags[1]]);
      }
    }
  }
}
