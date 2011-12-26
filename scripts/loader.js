var jewel = {
  screens: {}
};
window.addEventListener("load", function() {
  Modernizr.load([
    {
      load: [
	"scripts/sizzle.js",
	"scripts/dom.js",
	"scripts/game.js",
       "scripts/screen.splash.js"
      ],
      complete: function() {
	jewel.game.showScreen("splash-screen");
      }
    }
  ]);
}, false);
