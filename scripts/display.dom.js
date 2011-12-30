jewel.display = (function() {
  var dom = jewel.dom, $ = dom.$;
  var cols, rows, jewelSize;
  var firstRun = true;
  var jewelSprites;

  function setup() {
    var boardElement = $("#game-screen .game-board")[0];
    var container = document.createElement("div");
    var sprite;

    cols = jewel.settings.cols;
    rows = jewel.settings.rows;
    jewelSize = jewel.settings.jewelSize;
    jewelSprites = [];

    for (var x = 0; x < cols; x++) {
      jewelSprites[x] = [];
      for (var y = 0; y < rows; y++) {
        sprite = document.createElement("div");
        dom.addClass(sprite, "jewel");
        sprite.style.left = x + "em";
        sprite.style.top = y + "em";
        sprite.style.backgroundImage = "url(images/jewels" + jewelSize + ".png)";
        sprite.stylebackgroundSize = (jewel.settings.numJewelTypes * 100) + "%";
        jewelSprites[x][y] = sprite;
        container.appendChild(sprite);
      }
    }
    dom.addClass(container, "dom-container");
    boardElement.appendChild(createBackground());
    boardElement.appendChild(container);
  }

  function createBackground() {
    var background = document.createElement("div");
    for (var x = 0; x < cols; x++) {
      for (var y = 0; y < rows; y++) {
        if ((x + y) % 2) {
          var cell = document.createElement("div");
          cell.style.left = x + "em";
          cell.style.top = y + "em";
          background.appendChild(cell);
        }
      }
    }
    dom.addClass(background, "board-bg");
    return background;
  }

  function initialize(callback) {
    if (firstRun) {
      setup();
      firstRun = false;
    }
    callback();
  }

  function drawJewel(type, x, y) {
    var sprite = jewelSprites[x][y];
    sprite.style.backgroundPosition = type + "em 0em";
    sprite.style.display = "block";
  }

  function redraw(jewels, callback) {
    for (var x = 0; x < cols; x++) {
      for (var y = 0; y < rows; y++) {
        drawJewel(jewels[x][y], x, y);
      }
    }
    callback();
  }

  return {
    initialize: initialize,
    redraw: redraw
  };
})();