var jewel = {};
window.addEventListener("load", function() {
  Modernizr.load([
    {
      load: [
	"scripts/sizzle.js",
	"scripts/dom.js",
	"scripts/game.js"
      ],
      complete: function() {
	jewel.game.showScreen("splash-screen");
      }
    }
  ]);
}, false);
