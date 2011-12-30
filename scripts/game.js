jewel.game = (function() {
  var dom = jewel.dom;
  $ = dom.$;

  function setup() {
    // disable native touchmove behavior to prevent overscroll
    dom.bind(document, "touchmove", function(event) {
      event.preventDefault();
    });
    createBackground();
  }

  function showScreen(screenId) {
    var activeScreen = $("#game .screen.active")[0];
    var screen = $("#" + screenId)[0];
    if (activeScreen) {
      dom.removeClass(activeScreen, "active");
    }

    var args = Array.prototype.slice.call(arguments, 1);
    jewel.screens[screenId].run.apply(jewel.screens[screenId], args);
    dom.addClass(screen, "active");
  }

  function createBackground() {
    if (!Modernizr.canvas) return;
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    var background = $("#game .background")[0];
    var rect = background.getBoundingClientRect();
    var gradient;

    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.scale(rect.width, rect.height);
    gradient = ctx.createRadialGradient(0.25, 0.15, 0.5, 0.25, 0.15, 1);
    gradient.addColorStop(0, "rgb(55, 65, 50)");
    gradient.addColorStop(1, "rgb(0, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, 1);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = 0.008;
    ctx.beginPath();
    for (var i = 0; i < 2; i += 0.020) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i - 1, 1);
    }
    ctx.stroke();
    background.appendChild(canvas);
  }

  return {
    setup: setup,
    showScreen: showScreen
  }
})();
