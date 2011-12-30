jewel.display = (function() {
  var dom = jewel.dom, $ = dom.$;
  var canvas, ctx;
  var cols, rows, jewelSize;
  var firstRun = true;
  var jewels;
  var cursor;
  var previousCycle;

  function setup() {
    var boardElement = $("#game-screen .game-board")[0];
    cols = jewel.settings.cols;
    rows = jewel.settings.rows;
    jewelSize = jewel.settings.jewelSize;

    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
    dom.addClass(canvas, "board");
    canvas.width = cols * jewelSize;
    canvas.height = rows * jewelSize;
    ctx.scale(jewelSize, jewelSize);
    boardElement.appendChild(createBackground());
    boardElement.appendChild(canvas);

    previousCycle = Date.now();
    requestAnimationFrame(cycle);
  }

  function cycle(time) {
    renderCursor(time);
    previousCycle = time;
    requestAnimationFrame(cycle);
  }

  function initialize(callback) {
    if (firstRun) {
      setup();
      firstRun = false;
    }
    callback();
  }

  function createBackground() {
    var background = document.createElement("canvas");
    var bgctx = background.getContext("2d");
    dom.addClass(background, "background");
    background.width = cols * jewelSize;
    background.height = rows * jewelSize;
    bgctx.fillStyle = "rgba(225, 235, 255, 0.15)";
    for (var x = 0; x < cols; x++) {
      for (var y = 0; y < cols; y++) {
        if ((x + y) % 2) {
          bgctx.fillRect(x * jewelSize, y * jewelSize, jewelSize, jewelSize);
        }
      }
    }
    return background;
  }

  function drawJewel(type, x, y) {
    var image = jewel.images["images/jewels" + jewelSize + ".png"];
    ctx.drawImage(image, type * jewelSize, 0, jewelSize, jewelSize,
                  x, y, 1, 1);
  }

  function redraw(newJewels, callback) {
    jewels = newJewels;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var x = 0; x < cols; x++) {
      for (var y = 0; y < rows; y++) {
        drawJewel(jewels[x][y], x, y);
      }
    }
    callback();
  }

  function renderCursor(time) {
    if (!cursor) return;
    var x = cursor.x, y  = cursor.y;
    var t1 = (Math.sin(time / 200) + 1) / 2;
    var t2 = (Math.sin(time / 400) + 1) / 2;

    clearCursor();

    if (cursor.selected) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.8 * t1;
      drawJewel(jewels[x][y], x, y);
      ctx.restore();
    }
    ctx.save();
    ctx.lineWidth = 0.05;
    ctx.strokeStyle = "rgba(250, 250, 150, " + (0.5 + 0.5 * t2) + ")";
    ctx.strokeRect(x + 0.05, y + 0.05, 0.9, 0.9);
    ctx.restore();
  }

  function clearCursor() {
    if (!cursor) return;
    var x = cursor.x, y = cursor.y;
    clearJewel(x, y);
    drawJewel(jewels[x][y], x, y);
  }

  function setCursor(x, y, selected) {
    clearCursor();
    if (arguments.length > 0) {
      cursor = {
        x: x,
        y: y,
        selected: selected
      };

    } else {
      cursor = null;
    }
  }

  function clearJewel(x, y) {
    ctx.clearRect(x, y, 1, 1);
  }

  function moveJewels(movedJewels, callback) {
    var n = movedJewels.length;
    for (var i = 0; i < n; i++) {
      var mover = movedJewels[i];
      clearJewel(mover.fromX, mover.fromY);
    }
    for (var i = 0; i < n; i++) {
      var mover = movedJewels[i];
      drawJewel(mover.type, mover.toX, mover.toY);
    }
    callback();
  }

  function removeJewels(removedJewels, callback) {
    var n = removedJewels.length;
    for (var i = 0; i < n; i++) {
      clearJewel(removedJewels[i].x, removedJewels[i].y);
    }
    callback();
  }

  return {
    initialize: initialize,
    redraw: redraw,
    setCursor: setCursor,
    moveJewels: moveJewels,
    removeJewels: removeJewels,
    refill: redraw
  }
})();
