// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
precision mediump float;
  attribute vec4 a_Position; 
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position; 
    v_UV = a_UV;
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos;
  uniform bool u_lightOn;
  void main() {
    if (u_whichTexture == -3) {
        gl_FragColor = vec4((v_Normal + 1.0)/2.0, 1.0);
      }
      else if (u_whichTexture == -2) {
        gl_FragColor = u_FragColor;
      }
      else if (u_whichTexture == -1) {
        gl_FragColor = vec4(v_UV, 1.0,1.0);
      }
      else if (u_whichTexture == 0) {
        gl_FragColor = texture2D(u_Sampler0, v_UV);
      } 
      else if (u_whichTexture == 1) {
        gl_FragColor = texture2D(u_Sampler1, v_UV);
      } 
      else if (u_whichTexture == 2) {
        gl_FragColor = texture2D(u_Sampler2, v_UV);
      } 
    //   else {
    //     gl_FragColor = vec4(1,.2,.2,1);
    //   }
      
    vec3 lightVector = u_lightPos-vec3(v_VertPos) ;
      float r = length(lightVector);
      
      // if (r < 1.0) {
      //   gl_FragColor = vec4(1,0,0,1);
      // } else if (r < 2.0) {
      //   gl_FragColor = vec4(0,1,0,1);
      // }

      //gl_FragColor=vec4(vec3(gl_FragColor)/(r*r),1);

      //N dot L
      vec3 L = normalize(lightVector);
      vec3 N = normalize(v_Normal);
      float nDotL = max(dot(N,L), 0.0);

      vec3 R = reflect(-L, N);
      vec3 E = normalize(u_cameraPos-vec3(v_VertPos));
      float specular = pow(max(dot(E,R), 0.0),64.0) * 0.8;


      vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7;
      vec3 ambient = vec3(gl_FragColor) * 0.2;
      if(u_lightOn){
        if(u_whichTexture == 0) {
          gl_FragColor = vec4(specular + diffuse+ambient, 1.0);
        } else {
          gl_FragColor = vec4(diffuse+ambient, 1.0);
        }
      }


  }`;

let canvas;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_size; //size?
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_whichTexture;
let g_camera;
let u_lightPos;
let u_cameraPos;
let u_lightOn;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById("webgl");

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders.");
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, "a_UV");
  if (a_UV < 0) {
    console.log("Failed to get the storage location of a_UV");
    return;
  }

  a_Normal = gl.getAttribLocation(gl.program, "a_Normal");
  if (a_Normal < 0) {
    console.log("Failed to get the storage location of a_Normal");
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (!u_FragColor) {
    console.log("Failed to get the storage location of u_FragColor");
    return;
  }

  u_lightPos = gl.getUniformLocation(gl.program, "u_lightPos");
  if (!u_lightPos) {
    console.log("Failed to get the storage location of u_lightPos");
    return;
  }

  u_cameraPos = gl.getUniformLocation(gl.program, "u_cameraPos");
  if (!u_cameraPos) {
    console.log("Failed to get the storage location of u_cameraPos");
    return;
  }

  u_lightOn = gl.getUniformLocation(gl.program, "u_lightOn");
  if (!u_lightOn) {
    console.log("Failed to get the storage location of u_lightOn");
    return;
  }

  // u_size = gl.getUniformLocation(gl.program, "u_size");
  // if (!u_size) {
  //   console.log("Failed to get the storage location of u_Size");
  //   return;
  // }

  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (!u_ModelMatrix) {
    console.log("Failed to get the storage location of u_ModelMatrix");
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(
    gl.program,
    "u_GlobalRotateMatrix"
  );
  if (!u_GlobalRotateMatrix) {
    console.log("Failed to get the storage location of u_GlobalRotateMatrix");
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
  if (!u_ViewMatrix) {
    console.log("Failed to get the storage location of u_ViewMatrix");
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
  if (!u_ProjectionMatrix) {
    console.log("Failed to get the storage location of u_ProjectionMatrix");
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
  if (!u_Sampler0) {
    console.log("Failed to get the storage location of u_Sampler0");
    return;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
  if (!u_Sampler1) {
    console.log("Failed to get the storage location of u_Sampler1");
    return;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, "u_Sampler2");
  if (!u_Sampler2) {
    console.log("Failed to get the storage location of u_Sampler2");
    return;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, "u_whichTexture");
  if (!u_whichTexture) {
    console.log("Failed to get the storage location of u_whichTexture");
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}
// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//globals related to UI elements
let g_tailAnimation = false;
let g_headAnimation = false;
let g_bodyAnimation = false;
let g_xRotation = 0;
let g_yRotation = 0;
let g_globalAngle = 0;
let g_bodyAngle = 0;
let g_tailAngle = 0;
let g_headAngle = 0;
let g_selectedColor = [0.5, 0.5, 0.5, 1.0];
let g_selectedSize = 20;
let g_selectedType = POINT;
let num_segments = 5;
let g_Y_angle = 0;
let g_normalOn = false;
let g_lightPos = [0, 1, -2];
let g_LightOn = true;
function addActionsForHtmlUI() {
  document.getElementById("normal_on").onclick = function () {
    g_normalOn = true;
  };
  document.getElementById("normal_off").onclick = function () {
    g_normalOn = false;
  };
  document.getElementById("LightOn").onclick = function () {
    g_LightOn = false;
  };
  document.getElementById("LightOff").onclick = function () {
    g_LightOn = true;
  };
  document.getElementById("animationTailOffButton").onclick = function () {
    g_tailAnimation = false;
  };
  document.getElementById("animationTailOnButton").onclick = function () {
    g_tailAnimation = true;
  };

  document.getElementById("animationHeadOffButton").onclick = function () {
    g_headAnimation = false;
  };
  document.getElementById("animationHeadOnButton").onclick = function () {
    g_headAnimation = true;
  };

  document.getElementById("animationBodyOffButton").onclick = function () {
    g_bodyAnimation = false;
  };
  document.getElementById("animationBodyOnButton").onclick = function () {
    g_bodyAnimation = true;
  };

  document
    .getElementById("Xlight")
    .addEventListener("mousemove", function (ev) {
      if (ev.buttons == 1) {
        g_lightPos[0] = this.value / 100;
        renderAllShapes();
      }
    });
  document
    .getElementById("Ylight")
    .addEventListener("mousemove", function (ev) {
      if (ev.buttons == 1) {
        g_lightPos[1] = this.value / 100;
        renderAllShapes();
      }
    });
  document
    .getElementById("Zlight")
    .addEventListener("mousemove", function (ev) {
      if (ev.buttons == 1) {
        g_lightPos[2] = this.value / 100;
        renderAllShapes();
      }
    });

  document
    .getElementById("tailSlide")
    .addEventListener("mousemove", function () {
      g_tailAngle = this.value;
      renderAllShapes();
    });

  document
    .getElementById("bodySlide")
    .addEventListener("mousemove", function () {
      g_bodyAngle = this.value;
      renderAllShapes();
    });

  document
    .getElementById("headSlide")
    .addEventListener("mousemove", function () {
      g_headAngle = this.value;
      renderAllShapes();
    });

  document
    .getElementById("angleSlide")
    .addEventListener("mousemove", function () {
      g_globalAngle = this.value;
      renderAllShapes();
    });
}

function initTextures() {
  var image = new Image();
  if (!image) {
    console.log("Failed to create the image object");
    return false;
  }
  image.onload = function () {
    sendTextureToGLSL(image, 0);
  };

  image.src = "sky.jpeg";

  var grass_image = new Image();
  if (!grass_image) {
    console.log("Failed to create the image object");
    return false;
  }
  grass_image.onload = function () {
    sendTextureToGLSL(grass_image, 1);
  };

  grass_image.src = "floor.jpeg";

  var pig_image = new Image();
  if (!pig_image) {
    console.log("Failed to create the image object");
    return false;
  }
  pig_image.onload = function () {
    sendTextureToGLSL(pig_image, 2);
  };

  pig_image.src = "pig.jpeg";

  return true;
}

function sendTextureToGLSL(image, textureID) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log("Failed to create the texture object");
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  if (textureID == 0) {
    gl.activeTexture(gl.TEXTURE0);
  } else if (textureID == 1) {
    gl.activeTexture(gl.TEXTURE1);
  } else if (textureID == 2) {
    gl.activeTexture(gl.TEXTURE2);
  }
  // gl.activeTexture(gl.TEXTURE0 + textureID);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  if (textureID == 0) {
    gl.uniform1i(u_Sampler0, 0);
  } else if (textureID == 1) {
    gl.uniform1i(u_Sampler1, 1);
  } else if (textureID == 2) {
    gl.uniform1i(u_Sampler2, 2);
  }
  console.log("finished loadTexture");
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();

  addActionsForHtmlUI();

  document.onkeydown = keydown;

  //canvas.onmousedown = click;

  canvas.onmousemove = function (ev) {
    if (ev.buttons == 1) {
      g_xRotation += ev.movementX;
      g_yRotation -= ev.movementY;
      g_yRotation = Math.max(0, Math.min(90, g_yRotation));
      g_xRotation = Math.max(-90, Math.min(90, g_xRotation));
      renderAllShapes();
    }
  };

  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);
  //renderAllShapes();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  updateAnimationAngles();
  // console.log(performance.now());
  renderAllShapes();
  requestAnimationFrame(tick);
}

function keydown(ev) {
  switch (ev.keyCode) {
    case 83: // W
      g_eye[2] += 0.1;
      break;
    case 87: // S
      g_eye[2] -= 0.1;
      break;
    case 65: // A
      g_eye[0] -= 0.1;
      break;
    case 68: // D
      g_eye[0] += 0.1;
      break;
    case 37: // Left
      g_eye[0] -= 0.2;
      break;
    case 39: // Right
      g_eye[0] += 0.2;
      break;
    case 81: // Q
      g_Y_angle -= 5;
      break;
    case 69: // E
      g_Y_angle += 5;
  }
  renderAllShapes();
}

function updateAnimationAngles() {
  if (g_headAnimation) {
    g_headAngle = 5 * Math.sin(2 * g_seconds);
  }
  if (g_bodyAnimation) {
    g_bodyAngle = 5 * Math.sin(2 * g_seconds);
  }
  if (g_tailAnimation) {
    g_tailAngle = 20 * Math.sin(10 * g_seconds);
  }
  g_lightPos[0] = cos(g_seconds);
}

g_shapesList = [];

function click(ev) {
  let [x, y] = convertCoordinatesEventToGL(ev);
  // Store the coordinates to g_points array

  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
  }
  if (g_selectedType == CIRCLE) {
    point.segments = num_segments;
  }
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}

var g_eye = [0, 0, 3];
var g_at = [0, 0, -100];
var g_up = [0, 1, 0];

function renderAllShapes() {
  var startTime = performance.now();

  var projMat = new Matrix4();
  projMat.setPerspective(50, (1 * canvas.width) / canvas.height, 0.1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  //viewMat.setLookAt(1.25, 0, -2, 0, 0, 0, 0, 1, 0);
  viewMat.setLookAt(
    g_eye[0],
    g_eye[1],
    g_eye[2],
    g_at[0],
    g_at[1],
    g_at[2],
    g_up[0],
    g_up[1],
    g_up[2]
  );

  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4().rotate(g_Y_angle, 0, 1, 0);
  globalRotMat.translate(0.1, 0, 0);
  globalRotMat.rotate(-4, 0, 1, 0);
  globalRotMat.rotate(g_xRotation, 0, 1, 0);
  globalRotMat.rotate(g_yRotation, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_cameraPos, g_eye[0], g_eye[1], g_eye[2]);
  gl.uniform1f(u_lightOn, g_LightOn);

  renderScene();

  var duration = performance.now() - startTime;
  sendTextToHTML(
    " ms: " +
      Math.floor(duration) +
      "fps: " +
      Math.floor(10000 / duration) / 10,
    "numdot"
  );
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML ");
    return;
  }
  htmlElm.innerHTML = text;
}

function renderScene() {
  var light = new Cube();
  light.color = [2, 2, 0, 1];
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-0.1, -0.1, -0.1);
  light.matrix.translate(-0.5, -0.5, -0.5);
  light.render();

  var sky = new Cube();
  sky.color = [1, 0, 0, 1];
  sky.textureNum = 0;
  if (g_normalOn) sky.textureNum = -3;
  sky.matrix.scale(50, 50, 50);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();

  // Floor ====================================
  var floor = new Cube();
  floor.color = [1, 0, 0, 1];
  floor.textureNum = 1;
  floor.matrix.translate(0, -0.47, 0);
  floor.matrix.scale(10, 0, 10);
  floor.matrix.translate(-0.5, -0.5, -0.5);
  floor.render();

  //Define colors for different parts of the pig
  var colors = {
    body: [1.0, 0.75, 0.8, 1.0],
    head: [0.9, 0.6, 0.65, 1.0],
    leg: [0.9, 0.6, 0.65, 1.0],
    ear: [0.9, 0.3, 0.7, 1.0],
    snout: [1.0, 1.0, 0.8, 1.0],
    tail: [0.9, 0.3, 0.7, 1.0],
    new: [0.9, 0.3, 0.7, 1.0],
  };

  // Body of the pig
  var body = new Cube();
  body.color = colors.body;
  body.textureNum = 2;
  if (g_normalOn) body.textureNum = -3;
  body.matrix.setTranslate(-0.4, -0.3, 0.0);
  body.matrix.rotate(g_bodyAngle, 1, 0, 1);
  var bodyCoordinatesMat = new Matrix4(body.matrix);
  body.matrix.scale(1, 0.5, 0.5);
  body.render();

  // Head of the pig
  var head = new Cube();
  head.color = colors.head;
  head.textureNum = 2;
  head.matrix = bodyCoordinatesMat;
  head.matrix.translate(-0.35, 0.1, 0.035);
  head.matrix.rotate(g_headAngle, 0, 1, 0);
  head.matrix.scale(0.45, 0.45, 0.45);
  head.render();

  // front left leg
  var legBackRight = new Cube();
  legBackRight.color = colors.leg;
  legBackRight.textureNum = -2;
  legBackRight.matrix.setTranslate(-0.35, -0.45, -0.05);
  legBackRight.matrix.scale(0.15, 0.2, 0.15);
  legBackRight.render();

  // back left leg
  var legFrontRight = new Cube();
  legFrontRight.color = colors.leg;
  legFrontRight.textureNum = -2;
  legFrontRight.matrix.setTranslate(-0.15, -0.45, 0.4);
  legFrontRight.matrix.scale(0.15, 0.2, 0.15);
  legFrontRight.render();

  // back left leg
  var legBackLeft = new Cube();
  legBackLeft.color = colors.leg;
  legBackLeft.textureNum = -2;
  legBackLeft.matrix.setTranslate(0.15, -0.45, -0.05);
  legBackLeft.matrix.scale(0.15, 0.2, 0.15);
  legBackLeft.render();

  //back right leg
  var legFrontLeft = new Cube();
  legFrontLeft.color = colors.leg;
  legFrontLeft.textureNum = -2;
  legFrontLeft.matrix.setTranslate(0.35, -0.45, 0.4);
  legFrontLeft.matrix.scale(0.15, 0.2, 0.15);
  legFrontLeft.render();

  // Snout of the pig
  var snout = new Cube();
  snout.color = colors.snout;
  snout.textureNum = -2;
  snout.matrix = bodyCoordinatesMat;
  snout.matrix.translate(-0.5, 0, 0.225);
  snout.matrix.scale(0.5, 0.5, 0.5);
  snout.render();

  var leftEar = new Cube();
  leftEar.color = colors.ear;
  leftEar.textureNum = -2;
  leftEar.matrix = bodyCoordinatesMat;
  leftEar.matrix.translate(1.2, 2.0, -0.2);
  leftEar.matrix.scale(0.2, 0.3, 0.2);
  leftEar.render();

  var rightEar = new Cube();
  rightEar.color = colors.ear;
  rightEar.textureNum = -2;
  rightEar.matrix = bodyCoordinatesMat;
  rightEar.matrix.translate(0, 0, 6);
  rightEar.matrix.scale(1, 1, 1);
  rightEar.render();

  // Tail of the pig - small triangular prism to represent the tail
  var tail = new TriangularPrism();
  tail.color = colors.tail;
  tail.textureNum = -2;
  tail.matrix = bodyCoordinatesMat;
  tail.matrix.translate(28, -5, -2.5);
  tail.matrix.rotate(g_tailAngle, 0, 0, 1);
  tail.matrix.scale(4, 2, 2.5);
  tail.render();

  //sphere
  var s = new Sphere();
  s.matrix.translate(-2, 2, -2);
  s.render();
}
