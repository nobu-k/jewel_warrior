var jewel = {
  screens: {},
  settings: {
    rows: 8,
    cols: 8,
    baseScore: 100,
    numJewelTypes: 7
  }
};

Modernizr.addTest("standalone", function() {
  return window.navigator.standalone != false;
});

window.addEventListener("load", function() {
  yepnope.addPrefix("preload", function(resource) {
    resource.noexec = true;
    return resource;
  });

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
	jewel.game.setup();

	// hide the address bar on Android devices
	if (/Android/.test(navigator.userAgent)) {
	  $("#game")[0].style.height = "200%"; // making extra vertical spaces
	  setTimeout(function() {
	    window.scrollTo(0, 1);
	  }, 0);
	}

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
	load: [
	  "scripts/screen.main-menu.js"
	]
      },{
        test: Modernizr.webworkers,
        yep: ["scripts/board.worker-interface.js", "preload!scripts/board.worker.js"],
        nope: "scripts/board.js"
      }
    ]);
  }
}, false);
