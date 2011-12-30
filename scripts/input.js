jewel.input = (function() {
  var keys = {
    37: "KEY_LEFT",
    38: "KEY_UP",
    39: "KEY_RIGHT",
    40: "KEY_DOWN",
    13: "KEY_ENTER",
    32: "KEY_SPACE"
  };
  var dom = jewel.dom, $ = dom.$;
  var settings = jewel.settings;
  var inputHandlers;

  function initialize() {
    inputHandlers = {};

    var board = $("#game-screen .game-board")[0];
    dom.bind(board, "mousedown", function(event) {
      handleClick(event, "CLICK", event);
    });
    dom.bind(board, "touchstart", function(event) {
      handleClick(event, "TOUCH", event.targetTouches[0]);
    });
    dom.bind(document, "keydown", function(event) {
      var keyName = keys[event.keyCode];
      if (keyName && settings.controls[keyName]) {
        event.preventDefault();
        trigger(settings.controls[keyName]);
      }
    });
  }

  function handleClick(event, control, click) {
    var action = settings.controls[control];
    if (!action) return;

    var board = $("#game-screen .game-board")[0];
    var rect = board.getBoundingClientRect();
    var relX, relY;
    var jewelX, jewelY;

    relX = click.clientX - rect.left;
    relY = click.clientY - rect.top;
    jewelX = Math.floor(relX / rect.width * settings.cols);
    jewelY = Math.floor(relY / rect.height * settings.rows);

    trigger(action, jewelX, jewelY);
    event.preventDefault();
  }

  function bind(action, handler) {
    inputHandlers[action] = inputHandlers[action] || [];
    inputHandlers[action].push(handler);
  }

  function trigger(action) {
    var handlers = inputHandlers[action];
    var args = Array.prototype.slice.call(arguments, 1);
    if (handlers) {
      for (var i = 0; i < handlers.length; i++) {
        handlers[i].apply(null, args);
      }
    }
  }

  return {
    initialize: initialize,
    bind: bind
  };
})();