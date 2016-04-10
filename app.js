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
  object.Sockets[ID].emit('mapDATA', mapHandler.get('map_1'));
  object.Players[ID] = new Player (ID, 'Unnamed', mapHandler.get('map_1').player.x, mapHandler.get('map_1').player.y);

  Game.Start();
});

var Player = function (id, n, x, y) {
  this.id = id;
  this.nickname = n;
  this.x = x;
  this.y = y;
  this.velx = 0;
  this.vely = y;
  this.keysDown = {};
  this.speed = config.Player.speed;
  this.d = 1;
  this.viewport = {};
  this.viewport.x = 0;
  this.viewport.y = 0;

  object.intervals.Player[this.id] = [];
  object.cooldown[this.id] = [];
  object.cooldown[this.id].Jump = false;

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
        if(_this.x > 0) {
          _this.velx = _this.velx - _this.speed;
          _this.d = 0;
        }
      } else if(_this.keysDown[39] == true) {
        if(_this.x < mapHandler.get('map_1').width - config.Player.width) {
          _this.velx = _this.velx + _this.speed;
          _this.d = 2;
        }
      } else {
        _this.d = 1;
      }
      if(_this.keysDown[32] == true) {
        _this.Jump();
      }

      if(_this.x <= 0) {
        _this.x = 0;
        _this.d = 1;
      }
      if(_this.x >= mapHandler.get('map_1').width - config.Player.width) {
        _this.x = mapHandler.get('map_1').width - config.Player.width;
        _this.d = 1;
      }
      _this.velx *= config.Player.friction;
      _this.x += _this.velx;
      _this.viewport.x = _this.x;
    }, config.Player.interval);
  },
  Jump: function () {
    var _this = this;
    if(object.cooldown[_this.id].Jump == false) {
      object.cooldown[_this.id].Jump = true;

      object.intervals.Player[_this.id].Jump = setInterval(function () {
        if(_this.y > config.map.height - config.Player.Jump.height) {
          _this.y = _this.y - config.Player.Jump[0];
        } else {
          clearInterval(object.intervals.Player[_this.id].Jump);

          setTimeout(function () {
            object.intervals.Player[_this.id].JumpDown = setInterval(function () {
              if(_this.y <= config.map.height - config.Player.height) {
                _this.y = _this.y + config.Player.Jump[1];
              } else {
                clearInterval(object.intervals.Player[_this.id].JumpDown);
              }
            }, config.Player.interval);
          }, 10);

        }
      }, config.Player.interval);

      setTimeout(function () {
        object.cooldown[_this.id].Jump = false;
      }, config.Player.Jump.cooldown);
    }
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
