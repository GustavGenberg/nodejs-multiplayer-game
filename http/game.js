var config = [], socket, keysDown = {}, canvas, ctx, buffer = {}, defaultCanvasTranslation = 0;
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

/*console.log = function (data) {
  $(".console").prepend(data + '<br><br>');
};*/

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
        config.Block = [];
        config.Tree = [];
        config.Cloud = [];

        config.Player[0] = new Image ();
        config.Player[0].src = config.Sprites.player[0];

        config.Player[1] = new Image ();
        config.Player[1].src = config.Sprites.player[1];

        config.Player[2] = new Image ();
        config.Player[2].src = config.Sprites.player[2];

        config.Block[0] = new Image ();
        config.Block[0].src = config.Sprites.block[0];

        config.Tree[0] = new Image ();
        config.Tree[0].src = config.Sprites.tree[0];

        config.Cloud[0] = new Image ();
        config.Cloud[0].src = config.Sprites.cloud[0];
        console.log('Config data set');
        init();
      });
    });
  });
};

var bindSockets = function () {
  socket.on('drawingTime', function (data) {

    buffer.Players = data.Players;

  });
  socket.on('mapDATA', function (data) {
    buffer.map = data;
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
  console.log(buffer.Players);


  var draw = function () {
    ctx.clearRect(defaultCanvasTranslation, 0, config.map.width, config.map.height);
    for (each in buffer.Players) {
      var player = buffer.Players[each];
      var d;
      if(player.d == 0) d = 0;
      if(player.d == 1) d = 1;
      if(player.d == 2) d = 2;
      ctx.translate(0 + defaultCanvasTranslation - player.viewport.x, 0);
      defaultCanvasTranslation = player.viewport.x;
      ctx.beginPath();

      ctx.drawImage(config.Player[d], 0, 0, config.Player[1].width, config.Player[1].height, player.x, player.y, 40, 40);

      ctx.closePath();
    }


    ctx.beginPath()
    for(each in buffer.map.objects) {
      var tile = buffer.map.objects[each];
      if(tile.type == 0){
        block = config.Block[0];
        ctx.drawImage(block, 0, 0, 20, 20, tile.x, tile.y, 40, 40);
      }
      if(tile.type == 1) {
        block = config.Tree[0];
        ctx.drawImage(block, 0, 0, 30, 60, tile.x, tile.y, 50, 100);
      }
      if(tile.type == 2) {
        block = config.Cloud[0];
        ctx.drawImage(block, 0, 0, 75, 50, tile.x, tile.y, 75, 50);
      }
    }
    ctx.closePath();
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);

};
