var config = [], socket, keysDown = {}, canvas, ctx;
config.socket_protocol = 'http';
config.socket_host = 'localhost';
config.socket_port = '2222';

function loadScript(url, callback) {
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = url;
	script.onload = callback;
	head.appendChild(script);
}

console.log = function (data) {
  $(".console").prepend(data + '<br><br>');
};

window.onload = function () {
  loadScript('http://code.jquery.com/jquery-2.2.2.min.js', function () {
    loadScript(config.socket_protocol + '://' + config.socket_host + ':' + config.socket_port + '/socket.io/socket.io.js', function () {
      socket = io(config.socket_host + ':' + config.socket_port);
      socket.on('connect', function () {
        console.log('Socket connected');
        $('.console').empty();
      });
      socket.on('disconnect', function () {
        console.log('Disconnected');
        document.getElementById(canvas.id).remove();
      });
      socket.on('config', function (data) {
        config = data;
        config.Player = [];
        config.Player[0] = new Image ();
        config.Player[1] = new Image ();
        config.Player[2] = new Image ();
        config.Player[0].src = config.Sprites.player[0];
        config.Player[1].src = config.Sprites.player[1];
        config.Player[2].src = config.Sprites.player[2];
        console.log('Config data set');
        init();
      });
    });
  });
};

var bindSockets = function () {
  socket.on('drawingTime', function (data) {

    ctx.clearRect(0, 0, config.map.width, config.map.height);

    for (player in data.Players) {
      var player = data.Players[player];
      ctx.beginPath();

      ctx.drawImage(config.Player[1], player.x, player.y);

      ctx.closePath();
    }
  });
  setInterval(function () {
    socket.emit('keysDown', keysDown);
  }, 10);
};

var bindKeys = function () {
  document.addEventListener('keydown', function (event) {
    keysDown[event.keyCode] = true;
  });
  document.addEventListener('keyup', function (event) {
    delete keysDown[event.keyCode];
  });
};

var init = function () {

  console.log('init()');

  bindSockets();
  bindKeys();

  canvas = document.createElement('canvas');
  canvas.width = config.map.width;
  canvas.height = config.map.height;
  canvas.style.border = '1px solid rgb(224, 48, 34)';
  canvas.id = 'canvas';
  ctx = canvas.getContext('2d');
  $('body').append(canvas);



};
