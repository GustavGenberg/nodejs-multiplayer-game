var config = require('./config.js');
var express = require('express');
var io = require('socket.io')(config.socket.port);
var mapHandler = require('./maps/map_main.js');
var commandsHandler = require('./commands.js');
var object = require('./objects.js');

var app = express();

app.use(express.static(__dirname + '/http/'));
app.listen(config.express.port, function () {
  console.log('Express app listening on port ' + config.express.port);
});


mapHandler.load('map_1');
console.log(mapHandler.get('map_1'));
mapHandler.clear();
console.log(mapHandler.cache);

var generateRandomID = function () {
  var c;
  var loop = function () {
    c = Math.floor(Math.random() * 1000);
    if(c in object.ids) {
      loop();
    } else {
      object.ids.push(c);
    }
  };
  loop();
  return c;
};


commandsHandler.init();

io.on('connection', function (socket) {
  var ID = generateRandomID();
  object.Sockets[ID] = socket;
  object.Sockets[ID].emit('config', {Sprites: object.Sprites, map: config.map});
  object.Players[ID] = new Player (ID, 'Unnamed', (config.map.width / 2) - (config.Player.width / 2), config.map.height - config.Player.height);

  Game.Start();
});

var Player = function (id, n, x, y) {
  this.id = id;
  this.nickname = n;
  this.x = x;
  this.y = y;
  this.keysDown = {};

  object.intervals.Player[this.id] = [];

  this.init();
}
Player.prototype = {
  log: function (data) {
    console.log('Player ' + this.id + ': ' + data);
  },
  init: function () {
    var _this = this;

    _this.bindSockets();
    _this.Position();
  },
  bindSockets: function () {
    var _this = this;
    var socket = object.Sockets[_this.id];
    socket.on('keysDown', function (data) {
      _this.keysDown = data;
    });
    socket.on('disconnect', function () {
      Game.Reset();
    });
  },
  Position: function () {
    var _this = this;
    object.intervals.Player[_this.id].Position = setInterval(function () {
      if(_this.keysDown[37] == true) {
        _this.x--;
      }
      if(_this.keysDown[39] == true) {
        _this.x++;
      }
      if(_this.keysDown[32] == true) {
        _this.Jump();
      }
    }, config.Player.interval);
  },
  Jump: function () {
    var _this = this;
    object.intervals.Player[_this.id].Jump = setInterval(function () {
      if(_this.y < config.Player.Jump.height) {
        this_.y = this_.y + config.Player.Jump.speed[0];
      } else {
        clearInterval(object.intervals.Player[_this.id].Jump);
      }
    }, config.Player.interval);
  },
  Remove: function () {
    var _this = this;
    clearInterval(object.intervals.Player[_this.id].Jump);
    clearInterval(object.intervals.Player[_this.id].Position);
  }
};

var Game = [];
Game.Start = function () {
  object.intervals.world = setInterval(function () {
    io.emit('drawingTime', {Players: object.Players});
  }, 1000 / config.map.fps);
};
Game.Reset = function () {
  clearInterval(object.intervals.world);
};
