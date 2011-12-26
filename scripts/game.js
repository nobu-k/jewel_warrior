jewel.game = (function() {
  var dom = jewel.dom;
  $ = dom.$;

  function setup() {
    // disable native touchmove behavior to prevent overscroll
    dom.bind(document, "touchmove", function(event) {
      event.preventDefault();
    });
  }

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
    setup: setup,
    showScreen: showScreen
  }
})();
