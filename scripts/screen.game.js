jewel.screens["game-screen"] = (function() {
  var settings = jewel.settings;
  var board = jewel.board, display = jewel.display;
  var input = jewel.input;
  var cursor;
  var firstRun = true;

  function run() {
    if (firstRun) {
      setup();
      firstRun = false;
    }
    board.initialize(function() {
      display.initialize(function() {
        cursor = {
          x: 0,
          y: 0,
          selected: false
        };
        display.redraw(board.getBoard(), function() {});
      });
    });
  }

  function setup() {
    input.initialize();
    input.bind("selectJewel", selectJewel);
    input.bind("moveUp", moveUp);
    input.bind("moveDown", moveDown);
    input.bind("moveLeft", moveLeft);
    input.bind("moveRight", moveRight);
  }

  function moveUp() {
    moveCursor(0, -1);
  }

  function moveDown() {
    moveCursor(0, 1);
  }

  function moveLeft() {
    moveCursor(-1, 0);
  }

  function moveRight() {
    moveCursor(1, 0);
  }

  function selectJewel(x, y) {
    if (arguments.length == 0) {
      selectJewel(cursor.x, cursor.y);
      return;
    }

    if (!cursor.selected) {
      setCursor(x, y, true);
      return;
    }

    var dx = Math.abs(x - cursor.x), dy = Math.abs(y - cursor.y), dist = dx + dy;
    if (dist == 0) {
      setCursor(x, y, false);

    } else if (dist == 1) {
      board.swap(cursor.x, cursor.y, x, y, playBoardEvents);
      setCursor(x, y, false);

    } else {
      setCursor(x, y, true);
    }
  }

  function moveCursor(x, y) {
    if (cursor.selected) {
      x += cursor.x;
      y += cursor.y;
      if (x >= 0 && x < settings.cols && y >= 0 && y < settings.rows) {
        selectJewel(x, y);
      }
    } else {
      x = (cursor.x + x + settings.cols) % settings.cols;
      y = (cursor.y + y + settings.rows) % settings.rows;
      setCursor(x, y, false);
    }
  }

  function setCursor(x, y, select) {
    cursor.x = x;
    cursor.y = y;
    cursor.selected = select;
    display.setCursor(x, y, select);
  }

  function playBoardEvents(events) {
    if (!events || events.length == 0) {
      display.redraw(board.getBoard(), function() {
        // good to go again
      });
      return;
    }

    var boardEvent = events.shift();
    var next = function() { playBoardEvents(events); };
    switch (boardEvent.type) {
    case "move":
      display.moveJewels(boardEvent.data, next);
      break;

    case "remove":
      display.removeJewels(boardEvent.data, next);
      break;

    case "refill":
      display.refill(boardEvent.data, next);
      break;

    default:
      next();
      break;
    }
  }

  return {
    run: run
  };
})();
