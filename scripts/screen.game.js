jewel.screens["game-screen"] = (function() {
  var dom = jewel.dom, $ = dom.$;
  var settings = jewel.settings;
  var board = jewel.board, display = jewel.display;
  var input = jewel.input;
  var cursor;
  var firstRun = true;
  var gameState;

  function run() {
    if (firstRun) {
      setup();
      firstRun = false;
    }
    startGame();
  }

  function setup() {
    input.initialize();
    input.bind("selectJewel", selectJewel);
    input.bind("moveUp", moveUp);
    input.bind("moveDown", moveDown);
    input.bind("moveLeft", moveLeft);
    input.bind("moveRight", moveRight);
  }

  function startGame() {
    gameState = {
      level: 0,
      score: 0,
      timer: 0,
      startTime: 0,
      endTime: 0
    };
    cursor = {
      x: 0, y: 0, selected: false
    };

    updateGameInfo();
    setLevelTimer(true);
    board.initialize(function() {
      display.initialize(function() {
        display.redraw(board.getBoard(), function() {
          advanceLevel();
        });
      });
    });
  }

  function updateGameInfo() {
    $("#game-screen .score span")[0].innerHTML = gameState.score;
    $("#game-screen .level span")[0].innerHTML = gameState.level;
  }

  function setLevelTimer(reset) {
    if (gameState.timer) {
      clearTimeout(gameState.timer);
      gameState.timer = 0;
    }
    if (reset) {
      gameState.startTime = Date.now();
      gameState.endTime = settings.baseLevelTimer * Math.pow(gameState.level, -0.05 * gameState.level);
    }

    var delta = gameState.startTime + gameState.endTime - Date.now();
    var percent = (delta / gameState.endTime) * 100;
    var progress = $("#game-screen .time .indicator")[0];
    if (delta < 0) {
      gameOver();

    } else {
      progress.style.width = percent + "%";
      gameState.timer = setTimeout(setLevelTimer, 30);
    }
  }

  function addScore(points) {
    var nextLevelAt = Math.pow(settings.baseLevelScore,
                               Math.pow(settings.baseLevelExp, gameState.level - 1));
    gameState.score += points;
    if (gameState.score >= nextLevelAt) {
      advanceLevel();
    }
    updateGameInfo();
  }

  function advanceLevel() {
    gameState.level++;
    announce("Level " + gameState.level);
    updateGameInfo();
    gameState.startTime = Date.now();
    gameState.endTime = settings.baseLevelTimer * Math.pow(gameState.level, -0.05 * gameState.level);
    setLevelTimer(true);
    display.levelUp();
  }

  function gameOver() {
    display.gameOver(function() {
      announce("Game over");
    });
  }

  function announce(str) {
    var element = $("#game-screen .announcement")[0];
    element.innerHTML = str;
    if (Modernizr.cssanimations) {
      dom.removeClass(element, "zoomfade");
      setTimeout(function() {
        dom.addClass(element, "zoomfade");
      }, 1);

    } else {
      dom.addClass(element, "active");
      setTimeout(function() {
        dom.removeClass(element, "active");
      }, 1000);
    }
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
      announce("No moves!")
      display.refill(boardEvent.data, next);
      break;

    case "score":
      addScore(boardEvent.data);
      next();
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
