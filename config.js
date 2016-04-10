module.exports = {
  express: {
    port: 1111
  },
  socket: {
    port: 2222
  },
  map: {
    fps: 120,
    width: 600,
    height: 500
  },
  Player: {
    interval: 1,
    Jump: {
      0: 0.4,
      1: 0.3,
      height: 150,
      cooldown: 900
    },
    width: 40,
    height: 40,
    speed: 0.02,
    friction: 0.975
  }
};
