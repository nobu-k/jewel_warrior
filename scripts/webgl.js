jewel.webgl = (function() {
  function createShaderObject(gl, shaderType, source) {
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw gl.getShaderInfoLog(shader);
    }
    return shader;
  }

  function createProgramObject(gl, vs, fs) {
    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(program);
    }
    return program;
  }

  function createFloatBuffer(gl, data) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    return buffer;
  }

  function createIndexBuffer(gl, data) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);
    return buffer;
  }

  function setModelView(gl, program, pos, rot, axis) {
    var mvMatrix = mat4.identity(mat4.create());
    mat4.translate(mvMatrix, pos);
    mat4.rotate(mvMatrix, rot, axis);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "uModelView"), false, mvMatrix);
    return mvMatrix;
  }

  function setProjection(gl, program, fov, aspect, near, far) {
    var projMatrix = mat4.create();
    mat4.perspective(fov, aspect, near, far, projMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "uProjection"), false, projMatrix);
    return projMatrix;
  }

  function setNormalMatrix(gl, program, mv) {
    var normalMatrix = mat4.toMat3(mv);
    gl.uniformMatrix3fv(gl.getUniformLocation(program, "uNormalMatrix"), false, normalMatrix);
    return normalMatrix;
  }

  function createTextureObject(gl, image) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
  }

  function loadModel(gl, file, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", file, true);
    xhr.overrideMimeType("text/xml");
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200 && xhr.responseXML) {
          callback(parseCollada(gl, xhr.responseXML));
        }
      }
    };
    xhr.send(null);
  }

  function parseCollada(gl, xml) {
    // copied from the sample code of the book
    var $ = Sizzle,
    getInput = function(sem, par) {
      var el = $("input[semantic="+sem+"]", par)[0];
      return $(el.getAttribute("source"), mesh)[0];
    },
    parseVals = function(el) {
      var strvals = el.textContent.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
      return strvals.split(/\s+/).map(parseFloat);
    },
    mesh = $("geometry > mesh", xml)[0],
    triangles = $("triangles", mesh)[0],
    polylist = $("polylist", mesh)[0],
    vrtInput = getInput("VERTEX", polylist),
    posInput = getInput("POSITION", vrtInput),
    nrmInput = getInput("NORMAL", polylist),
    nrmList = parseVals($("float_array", nrmInput)[0]),
    idxList = parseVals($("p", polylist)[0]),
    i, j, v, n;

    vertices = parseVals($("float_array", posInput)[0]);
    normals = [];
    indices = [];

    for (i=0;i<idxList.length;i+=6) {
      for (j=0;j<3;j++) {
        v = idxList[i + j * 2],
        n = idxList[i + j * 2 + 1];
        indices.push(v);
        normals[v*3] = nrmList[n*3];
        normals[v*3+1] = nrmList[n*3+1];
        normals[v*3+2] = nrmList[n*3+2];
      }
    }

    return {
      vbo: createFloatBuffer(gl, vertices),
      nbo: createFloatBuffer(gl, normals),
      ibo: createIndexBuffer(gl, indices),
      num: indices.length
    };
  }

  return {
    createShaderObject: createShaderObject,
    createProgramObject: createProgramObject,
    createFloatBuffer: createFloatBuffer,
    createIndexBuffer: createIndexBuffer,
    createTextureObject: createTextureObject,
    setModelView: setModelView,
    setProjection: setProjection,
    setNormalMatrix: setNormalMatrix,
    loadModel: loadModel
  };
})();