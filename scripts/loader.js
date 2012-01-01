var jewel = {
  screens: {},
  settings: {
    rows: 8,
    cols: 8,
    baseScore: 100,
    numJewelTypes: 7,
    baseLevelTimer: 60000,
    baseLevelScore: 1500,
    baseLevelExp: 1.05,
    controls: {
      KEY_UP: "moveUp",
      KEY_LEFT: "moveLeft",
      KEY_DOWN: "moveDown",
      KEY_RIGHT: "moveRight",
      KEY_ENTER: "selectJewel",
      KEY_SPACE: "selectJewel",
      CLICK: "selectJewel",
      TOUCH: "selectJewel"
    }
  },
  images: {}
};

Modernizr.addTest("standalone", function() {
  return window.navigator.standalone != false;
});

Modernizr.addTest("webgl2", function() {
  try {
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("experimental-webgl");
    return !!ctx;
  } catch (e) {
    return false;
  }
});

window.addEventListener("load", function() {
  var jewelProto = document.getElementById("jewel-proto");
  var rect = jewelProto.getBoundingClientRect();
  jewel.settings.jewelSize = rect.width;

  var numPreload = 0, numLoaded = 0;

  function getLoadProgress() {
    if (numPreload > 0) return numLoaded / numPreload;
    return 0;
  }

  yepnope.addPrefix("loader", function(resource) {
    var isImage = /.+\.(jpg|png|gif)$/i.test(resource.url);
    resource.noexec = isImage;
    numPreload++;
    resource.autoCallback = function(e) {
      numLoaded++;
      if (isImage) {
        var image = new Image();
        image.src = resource.url;
        jewel.images[resource.url] = image;
      }
    };
    return resource;
  });

  yepnope.addPrefix("preload", function(resource) {
    resource.noexec = true;
    return resource;
  });

  Modernizr.load([
    {
      load: [
	"scripts/sizzle.js",
	"scripts/dom.js",
        "scripts/requestAnimationFrame.js",
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
	  jewel.game.showScreen("splash-screen", getLoadProgress);
	} else {
	  jewel.game.showScreen("install-screen");
	}
      }
    }
  ]);

  console.log(Modernizr.webgl2);
  if (Modernizr.standalone) {
    Modernizr.load([
      {
        test: Modernizr.webgl2,
        yep: [
          "loader!scripts/webgl.js",
          "loader!scripts/glMatrix-0.9.5.min.js",
          "loader!scripts/display.webgl.js",
          "loader!images/jewelpattern.jpg"
        ]
      },{
        test: Modernizr.canvas && !Modernizr.webgl2,
        yep: "loader!scripts/display.canvas.js"
      },{
        test: !Modernizr.canvas,
        yep: "loader!scripts/display.dom.js"
      },{
        test: Modernizr.webworkers,
        yep: ["loader!scripts/board.worker-interface.js", "preload!scripts/board.worker.js"],
        nope: "loader!scripts/board.js"
      },{
	load: [
          "loader!scripts/input.js",
          "loader!scripts/screen.main-menu.js",
          "loader!scripts/screen.game.js",
          "loader!images/jewels" + jewel.settings.jewelSize + ".png"
	]
      }
    ]);
  }
}, false);
