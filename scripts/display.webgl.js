jewel.display = (function() {
  var dom = jewel.dom, webgl = jewel.webgl, $ = dom.$;
  var canvas, gl;

  var program, geometry, aVertex, aNormal, uScale, uColor;
  var colors = [
    [0.1, 0.8, 0.1],
    [0.9, 0.1, 0.1],
    [0.9, 0.3, 0.8],
    [0.8, 1.0, 1.0],
    [0.2, 0.4, 1.0],
    [1.0, 0.4, 0.1],
    [1.0, 0.9, 0.1]
  ];

  var animations = [];
  var previousCycle;
  var firstRun = true;
  var jewels;
  var cursor;
  var cols, rows;

  function initialize(callback) {
    if (firstRun) {
      setup();
      firstRun = false;
    }
    requestAnimationFrame(cycle);
    callback();
  }

  function setup() {
    var boardElement = $("#game-screen .game-board")[0];
    cols = jewel.settings.cols;
    rows = jewel.settings.rows;
    jewels = [];
    canvas = document.createElement("canvas");
    gl = canvas.getContext("experimental-webgl");
    dom.addClass(canvas, "board");
    canvas.width = cols * jewel.settings.jewelSize;
    canvas.height = rows * jewel.settings.jewelSize;
    boardElement.appendChild(canvas);
    setupGL();
  }

  function setupGL() {
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    program = setupShaders();
    setupTexture();
    gl.useProgram(program);
    aVertex = gl.getAttribLocation(program, "aVertex");
    aNormal = gl.getAttribLocation(program, "aNormal");
    uScale = gl.getUniformLocation(program, "uScale");
    uColor = gl.getUniformLocation(program, "uColor");
    gl.enableVertexAttribArray(aVertex);
    gl.enableVertexAttribArray(aNormal);
    gl.uniform1f(gl.getUniformLocation(program, "uAmbient"), 0.12);
    gl.uniform3f(gl.getUniformLocation(program, "uLightPosition"), 0, 15, 0);
    webgl.loadModel(gl, "models/jewel.dae", function(geom) {
      geometry = geom;
    });
    webgl.setProjection(gl, program, 60, cols / rows, 0.1, 100);
  }

  function setupShaders() {
                var vsource =
                "attribute vec3 aVertex;\r\n" +
                "attribute vec3 aNormal;\r\n" +

                "uniform mat4 uModelView;\r\n" +
                "uniform mat4 uProjection;\r\n" +
                "uniform mat3 uNormalMatrix;\r\n" +
                "uniform vec3 uLightPosition;\r\n" +

                "uniform float uScale;\r\n" +

                "varying float vDiffuse;\r\n" +
                "varying float vSpecular;\r\n" +
                "varying vec4 vPosition;\r\n" +
                "varying vec3 vNormal;\r\n" +

                "void main(void) {\r\n" +
                "       vPosition = uModelView * vec4(aVertex * uScale, 1.0);\r\n" +
                "       vNormal = normalize(aVertex);\r\n" +

                "       vec3 normal = normalize(uNormalMatrix * aNormal);\r\n" +
                "       vec3 lightDir = uLightPosition - vPosition.xyz;\r\n" +
                "       lightDir = normalize(lightDir);\r\n" +

                "       vDiffuse = max(dot(normal, lightDir), 0.0);\r\n" +

                "       vec3 viewDir = normalize(vPosition.xyz);\r\n" +
                "       vec3 reflectDir = reflect(lightDir, normal);\r\n" +
                "       float specular = dot(reflectDir, viewDir);\r\n" +
                "       vSpecular = pow(specular, 16.0);\r\n" +

                "       gl_Position = uProjection * vPosition;\r\n" +
                "}"
    ;

                var fsource =
                "#ifdef GL_ES\r\n" +
                "precision mediump float;\r\n" +
                "#endif\r\n" +

                "uniform sampler2D uTexture;\r\n" +
                "uniform float uAmbient;\r\n" +
                "uniform vec3 uColor;\r\n" +

                "varying float vDiffuse;\r\n" +
                "varying float vSpecular;\r\n" +
                "varying vec3 vNormal;\r\n" +

                "void main(void) {\r\n" +
                "       float theta = acos(vNormal.y) / 3.14159;" +
                "       float phi = atan(vNormal.z, vNormal.x) / (2.0 * 3.14159);" +
                "       vec2 texCoord = vec2(-phi, theta);" +

                "       float texColor = texture2D(uTexture, texCoord).r;\r\n" +

                "       float light = uAmbient + vDiffuse + vSpecular + texColor;\r\n" +

                "       gl_FragColor = vec4(uColor * light, 0.7);\r\n" +
                "}\r\n"
    ;

    var vshader = webgl.createShaderObject(gl, gl.VERTEX_SHADER, vsource);
    var fshader = webgl.createShaderObject(gl, gl.FRAGMENT_SHADER, fsource);

    return webgl.createProgramObject(gl, vshader, fshader);
  }

  function setupTexture() {
    var image = new Image();
    image.addEventListener("load", function() {
      var texture = webgl.createTextureObject(gl, image);
      gl.uniform1i(gl.getUniformLocation(program, "uTexture"),
                   "uTexture", 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
    }, false);
    image.src = "images/jewelpattern.jpg";
  }

  function cycle(time) {
    renderAnimations(time, previousCycle);
    if (geometry) draw();
    previousCycle = time;
    requestAnimationFrame(cycle);
  }

  function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.bindBuffer(gl.ARRAY_BUFFER, geometry.vbo);
    gl.vertexAttribPointer(aVertex, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, geometry.nbo);
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.ibo);
    jewels.forEach(drawJewel);
  }

  function drawJewel(jewel) {
    var x = jewel.x - cols / 2 + 0.5;
    var y = -jewel.y + rows / 2 - 0.5;
    var scale = jewel.scale, n = geometry.num;
    var mv = webgl.setModelView(gl, program,
                                [x * 4.4, y * 4.4, -32],
                                Date.now() / 1500 + jewel.rnd * 100, // rotate
                                [0, 1, 0.1]); // rotation axis
    webgl.setNormalMatrix(gl, program, mv);
    if (cursor && jewel.x == cursor.x && jewel.y == cursor.y) {
      // TODO: draw box
      // TODO: apply following only when the jewel is seleted.
      scale *= 1.0 + Math.sin(Date.now() / 100) * 0.1;
    }
    gl.uniform1f(uScale, scale);
    gl.uniform3fv(uColor, colors[jewel.type]);
    gl.cullFace(gl.FRONT);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
    gl.cullFace(gl.BACK);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
  }

  function createJewel(x, y, type) {
    var jewel = {
      x: x,
      y: y,
      type: type,
      rnd: Math.random() * 2 - 1,
      scale: 1
    };
    jewels.push(jewel);
    return jewel;
  }

  function getJewel(x, y) {
    return jewels.filter(function(j) {
      return j.x == x && j.y == y;
    })[0];
  }

  function setCursor(x, y, selected) {
    cursor = null;
    if (arguments.length > 0) {
      cursor = {
        x: x,
        y: y,
        selected: selected
      };
    }
  }

  function levelUp(callback) {
    addAnimation(500, {
      render: function(pos) {
        gl.uniform1f(gl.getUniformLocation(program, "uAmbient"),
                     0.12 + Math.sin(pos * Math.PI) * 0.5);
      },
      done: callback
    });
  }

  function gameOver(callback) {
    removeJewels(jewels, callback);
  }

  function redraw(newJewels, callback) {
    for (var x = 0; x < cols; x++) {
      for (var y = 0; y < rows; y++) {
        var type = newJewels[x][y];
        var jewel = getJewel(x, y);
        if (jewel) jewel.type = type;
        else createJewel(x, y, type);
      }
    }
    callback();
  }

  function moveJewels(movedJewels, callback) {
    var n = movedJewels.length;
    movedJewels.forEach(function(mover) {
      var jewel = getJewel(mover.fromX, mover.fromY);
      var dx = mover.toX - mover.fromX;
      var dy = mover.toY - mover.fromY;
      var dist = Math.abs(dx) + Math.abs(dy);
      if (!jewel) {
        jewel = createJewel(mover.fromX, mover.fromY, mover.type);
      }
      addAnimation(200 * dist, {
        render: function(pos) {
          pos = Math.sin(pos * Math.PI / 2);
          jewel.x = mover.fromX + dx * pos;
          jewel.y = mover.fromY + dy * pos;
        },
        done: function() {
          jewel.x = mover.toX;
          jewel.y = mover.toY;
          if (--n === 0) callback();
        }
      });
    });
  }

  function removeJewels(removedJewels, callback) {
    var n = removedJewels.length;
    removedJewels.forEach(function(removed) {
      var jewel = getJewel(removed.x, removed.y);
      var x = jewel.x, y = jewel.y;
      addAnimation(400, {
        render: function(pos) {
          jewel.x = x + jewel.rnd * pos * 2;
          jewel.y = y + pos * pos * 2;
          jewel.scale = 1 - pos;
        },
        done: function() {
          jewels.splice(jewels.indexOf(jewel), 1);
          if (--n == 0) callback();
        }
      });
    });
  }

  function addAnimation(runTime, fncs) {
    var anim = {
      runTime: runTime,
      startTime: Date.now(),
      pos: 0,
      fncs: fncs
    };
    animations.push(anim);
  }

  function renderAnimations(time, lastTime) {
    var anims = animations.slice(0);
    var n = anims.length;

    for (var i = 0; i < n; i++) {
      var anim = anims[i];
      if (anim.fncs.before) {
        anim.fncs.before(anim.pos);
      }
      anim.lastPos = anim.pos;
      var animTime = (lastTime - anim.startTime);
      anim.pos = animTime / anim.runTime;
      anim.pos = Math.max(0, Math.min(1, anim.pos));
    }

    animations = [];
    for (var i = 0; i < n; i++) {
      var anim = anims[i];
      anim.fncs.render(anim.pos, anim.pos - anim.lastPos);
      if (anim.pos == 1) {
        if (anim.fncs.done) anim.fncs.done();
      } else {
        animations.push(anim);
      }
    }
  }

  return {
    initialize: initialize,
    redraw: redraw,
    setCursor: setCursor,
    moveJewels: moveJewels,
    removeJewels: removeJewels,
    refill: redraw,
    levelUp: levelUp,
    gameOver: gameOver
  };
})();