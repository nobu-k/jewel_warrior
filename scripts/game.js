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

    var args = Array.prototype.slice.call(arguments, 1);
    jewel.screens[screenId].run.apply(jewel.screens[screenId], args);
    dom.addClass(screen, "active");
  }

  return {
    setup: setup,
    showScreen: showScreen
  }
})();
