jewel.game = (function() {
  var dom = jewel.dom;
  $ = dom.$;

  function showScreen(screenId) {
    var activeScreen = $("#game .screen.active")[0];
    var screen = $("#" + screenId)[0];
    if (activeScreen) {
      dom.removeClass(activeScreen, "active");
    }
    jewel.screens[screenId].run();
    dom.addClass(screen, "active");
  }

  return {
    showScreen: showScreen
  }
})();
