var jewel = {
  screens: {}
};

Modernizr.addTest("standalone", function() {
  return window.navigator.standalone != false;
});

window.addEventListener("load", function() {
  Modernizr.load([
    {
      load: [
	"scripts/sizzle.js",
	"scripts/dom.js",
	"scripts/game.js"
      ]
    },{
      test: Modernizr.standalone,
      yep: "scripts/screen.splash.js",
      nope: "scripts/screen.install.js",
      complete: function() {
	if (Modernizr.standalone) {
	  jewel.game.showScreen("splash-screen");
	} else {
	  jewel.game.showScreen("install-screen");
	}
      }
    }
  ]);

  if (Modernizr.standalone) {
    Modernizr.load([
      {
	load: ["scripts/screen.main-menu.js"]
      }
    ]);
  }
}, false);
