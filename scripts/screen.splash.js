jewel.screens["splash-screen"] = (function() {
  var game = jewel.game, dom = jewel.dom;
  firstRun = true;

  function setup() {
    dom.bind("#splash-screen", "click", function() {
      game.showScreen("main-menu");
    });
  }

  function run() {
    if (firstRun) {
      setup();
      firstRun = false;
    }
  }

  return {
    run: run
  };
})();
