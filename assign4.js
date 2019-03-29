// assign4.js: Starter code for Assignment 4
var gl;
var canvas;
var program;

var g_matrixStack = []; // Stack for storing a matrix
var modelViewMatrix = mat4();	// model-view matrix
var projectionMatrix;		// Projection matrix
var modelViewMatrixLoc, projectionMatrixLoc;
var numVertices = 24; //(6 faces)(4 vertices for triangle-fan comprising each fan)

var points = [];		// Coordinates generated for all cubie faces
var colors = [];		// Associated colors

var myCube = new Rubik3x3();	// Rubik cube "object" with operations as documented in
// rubik-helper.js

// Starting coordinates (that is, before transformations) for each
// cubie
var vertices = [
    vec4(-0.5,-0.5, 0.5, 1.0),  // vertex 0
    vec4(-0.5, 0.5, 0.5, 1.0),  // 1
    vec4( 0.5, 0.5, 0.5, 1.0),  // 2
    vec4( 0.5,-0.5, 0.5, 1.0),  // 3
    vec4(-0.5,-0.5,-0.5, 1.0),  // 4
    vec4(-0.5, 0.5,-0.5, 1.0),  // 5
    vec4( 0.5, 0.5,-0.5, 1.0),  // 6
    vec4( 0.5,-0.5,-0.5, 1.0)   // 7
];

// RGBA colors for cubies
var vertexColors = [
    vec4(0.5,0.5,0.5,1.0),   // 0  hidden (gray)                     
    vec4(1.0,0.0,0.0,1.0),   // 1  red           RIGHT face  (x+)  
    vec4(1.0,0.35,0.0,1.0),  // 2  orange        LEFT face   (x-)
    vec4(0.0,0.0,1.0,1.0),   // 3  blue          UP face     (y+)
    vec4(0.0,1.0,0.0,1.0),   // 4  green         DOWN face   (y-)
    vec4(1.0,1.0,1.0,1.0),   // 5  white         FRONT face  (z+)
    vec4(1.0,1.0,0.0,1.0)    // 6  yellow        BACK face   (z-)  
];

var trans = [ 			// Translation from origin for each cubie
    [-1.0, 1.0, 1.0],
    [ 0.0, 1.0, 1.0],
    [ 1.0, 1.0, 1.0],
    [-1.0, 0.0, 1.0],
    [ 0.0, 0.0, 1.0],
    [ 1.0, 0.0, 1.0],
    [-1.0,-1.0, 1.0],
    [ 0.0,-1.0, 1.0],
    [ 1.0,-1.0, 1.0],
    
    [-1.0, 1.0, 0.0],
    [ 0.0, 1.0, 0.0],
    [ 1.0, 1.0, 0.0],
    [-1.0, 0.0, 0.0],
    [ 1.0, 0.0, 0.0],
    [-1.0,-1.0, 0.0],
    [ 0.0,-1.0, 0.0],
    [ 1.0,-1.0, 0.0],
    
    [-1.0, 1.0,-1.0],
    [ 0.0, 1.0,-1.0],
    [ 1.0, 1.0,-1.0],
    [-1.0, 0.0,-1.0],
    [ 0.0, 0.0,-1.0],
    [ 1.0, 0.0,-1.0],
    [-1.0,-1.0,-1.0],
    [ 0.0,-1.0,-1.0],
    [ 1.0,-1.0,-1.0]
];

// accum_rotation is an array of 26 mat4's that is not currently used
// in your starter code.  However, the intent is that
// accum_rotation[i] provide the matrix that encompasses the entire
// accumulation of R,r,L,l,U,u,D,d,F,f,B,b rotations that have been
// triggered by user interactions at any point in time
var accum_rotation = [
    mat4(), mat4(), mat4(), mat4(), mat4(), mat4(), mat4(), mat4(),
    mat4(), mat4(), mat4(), mat4(), mat4(), mat4(), mat4(), mat4(),
    mat4(), mat4(), mat4(), mat4(), mat4(), mat4(), mat4(), mat4(),
    mat4(), mat4(),
];

var viewer = [7.0, 3.0, 7.0]; // initial viewer location 

var viewerMat = mat4(vec4(viewer[0],0,0,0),vec4(0,viewer[1],0,0),vec4(0,0,viewer[2],0),vec4(0,0,0,1));
var defaultViewerMat = mat4(vec4(viewer[0],0,0,0),vec4(0,viewer[1],0,0),vec4(0,0,viewer[2],0),vec4(0,0,0,1));

window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );
    
    //    gl = WebGLUtils.setupWebGL( canvas );
    gl = WebGLDebugUtils.makeDebugContext( canvas.getContext("webgl") ); // For debugging
    if ( !gl ) { alert( "WebGL isn't available" );
	       }
    
    generateVertsAndColors();
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    // Enable depth testing 
    gl.enable(gl.DEPTH_TEST);

    // Polygon offset avoids "z-fighting" between triangles and line
    // loops, ensuring lines will be in front of filled triangles
    gl.depthFunc(gl.LEQUAL);	
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 2.0);

    //  Load shaders and initialize attribute buffers

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU and associate our shader variables
    // with our data buffer

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vPosition );    

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
    
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    
    // Button event-handlers for rotation will need to be written by
    // you.  For the sake of your code's clarity, these event handlers
    // must not be written in their entirety here in window.onload but
    // instead they should defer what they do to functions that are
    // written outside of window.onload and merely called here.
    // Failing to follow this requirement will mean that your code
    // will be impossible to read, and substantial style points will
    // therefore be deducted.
    document.getElementById( "xButton" ).onclick = function () {
		viewerMat = mult(viewerMat, rotate(2.0, vec3(1,0,0)));
		for(var i = 0; i < viewer.length; i++)
		{
			viewer[i] = (viewerMat[i][0])+
						(viewerMat[i][1])+
						(viewerMat[i][2])+
						(viewerMat[i][3]);
		} 
    };
    document.getElementById( "yButton" ).onclick = function () {
		viewerMat = mult(viewerMat, rotate(2.0, vec3(0,1,0)));
		for(var i = 0; i < viewer.length; i++)
		{
			viewer[i] = (viewerMat[i][0])+
						(viewerMat[i][1])+
						(viewerMat[i][2])+
						(viewerMat[i][3]);
		} 
    };
    document.getElementById( "zButton" ).onclick = function () {
		viewerMat = mult(viewerMat, rotate(2.0, vec3(0,0,1)));
		for(var i = 0; i < viewer.length; i++)
		{
			viewer[i] = (viewerMat[i][0])+
						(viewerMat[i][1])+
						(viewerMat[i][2])+
						(viewerMat[i][3]);
		} 
    };
    document.getElementById( "ResetButton" ).onclick = function () {
		viewerMat = defaultViewerMat;
		for(var i = 0; i < viewer.length; i++)
		{
			viewer[i] = (viewerMat[i][0])+
						(viewerMat[i][1])+
						(viewerMat[i][2])+
						(viewerMat[i][3]);
		} 
    };
    document.getElementById( "RButton" ).onclick = function () {
		var result = myCube.performAction("R");
		console.log(result);
    };
    document.getElementById( "rButton" ).onclick = function () {
		var result = myCube.performAction("r");
		console.log(result);
    };
    document.getElementById( "LButton" ).onclick = function () {
		var result = myCube.performAction("L");
		console.log(result);
    };
    document.getElementById( "lButton" ).onclick = function () {
		var result = myCube.performAction("l");
		console.log(result);
    };
    document.getElementById( "UButton" ).onclick = function () {
		var result = myCube.performAction("U");
		console.log(result);
    };
    document.getElementById( "uButton" ).onclick = function () {
		var result = myCube.performAction("u");
		console.log(result);
    };
    document.getElementById( "DButton" ).onclick = function () {
		var result = myCube.performAction("D");
		console.log(result);
    };
    document.getElementById( "dButton" ).onclick = function () {
		var result = myCube.performAction("d");
		console.log(result);
    };
    document.getElementById( "FButton" ).onclick = function () {
		var sideCoords = [];
		for(var i = 0; i < 9; i++){
			sideCoords[i] = myCube.cubie_at_position[i];
			accum_rotation[sideCoords[i]] = mult(accum_rotation[sideCoords[i]],rotate(-90,vec3(0,0,1)));
		}
		var result = myCube.performAction("F");
		applyTransformation();
		//var sideCoords = [0,1,2,3,4,5,6,7,8];
		//var tempCubiePosition;
		//console.log(result);
		//for(var i = 0; i < result.length; i++){
		//	console.log(myCube.cubie_at_position[i]);
		//	tempCubiePosition = myCube.cubie_at_position[sideCoords[i]];
		//	myCube.cubie_at_position[sideCoords[i]] = myCube.cubie_at_position[result[i]];
		//	myCube.cubie_at_position[result[i]] = tempCubiePosition;
		//}
    };
    document.getElementById( "fButton" ).onclick = function () {
		var result = myCube.performAction("f");
		console.log(result);
    };
    document.getElementById( "BButton" ).onclick = function () {
		var result = myCube.performAction("B");
		console.log(result);
    };
    document.getElementById( "bButton" ).onclick = function () {
		var result = myCube.performAction("b");
		console.log(result);
    };
    document.getElementById( "RandomButton" ).onclick = function () {
    };
    document.getElementById( "ScrambleButton" ).onclick = function () {
    };
    render();
};

// Points and colors for one face of a cubie
function cubie_side(a, b, c , d, col)
{
    points.push(vertices[a],vertices[b],vertices[c],vertices[d]);
    colors.push(vertexColors[col],vertexColors[col],
		vertexColors[col],vertexColors[col]);
};

// Generate vertices for cubie i
function cubie(i)
{
    cubie_side(0,3,2,1,myCube.getCubieColor(myCube.cubie_at_position[i])[4]);
    cubie_side(2,3,7,6,myCube.getCubieColor(myCube.cubie_at_position[i])[0]);
    cubie_side(0,4,7,3,myCube.getCubieColor(myCube.cubie_at_position[i])[3]);
    cubie_side(1,2,6,5,myCube.getCubieColor(myCube.cubie_at_position[i])[2]);
    cubie_side(4,5,6,7,myCube.getCubieColor(myCube.cubie_at_position[i])[5]);
    cubie_side(0,1,5,4,myCube.getCubieColor(myCube.cubie_at_position[i])[1]);
}

// Genereate all vertex data for entire Rubik's cube
function generateVertsAndColors () {
    for (var i = 0; i < myCube.TOTAL_CUBIES; i++) {
	cubie(i);
    }
};

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    projectionMatrix = perspective(45.0, canvas.width / canvas.height, 2.0, 20.0); 
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
    modelViewMatrix = lookAt(vec3(viewer[0],viewer[1],viewer[2]), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
    
    for (var i = 0; i < points.length; i = i + numVertices) {
	g_matrixStack.push(modelViewMatrix);
 	modelViewMatrix = mult(modelViewMatrix,
			       translate(trans[i/numVertices][0],
					 trans[i/numVertices][1],
					 trans[i/numVertices][2]));
	gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	for (var j = i; j < i + numVertices; j = j + 4) {
	    gl.uniform1i(gl.getUniformLocation(program, "outline_mode"), 0);
            gl.drawArrays( gl.TRIANGLE_FAN, j, 4 );
	    gl.uniform1i(gl.getUniformLocation(program, "outline_mode"), 1);
            gl.drawArrays( gl.LINE_LOOP, j, 4 );
	}
	modelViewMatrix = g_matrixStack.pop();
    };

    requestAnimFrame( render );
}

var applyTransformation = function (){
	var pointCount = 0;
	var num = 0;
	for(var i = 0; i < accum_rotation.length; i++)
	{
		for(var j = 0; j < 26; j++)
		{
			var pointMat = mat4(vec4(points[pointCount],0,0,0),vec4(0,points[pointCount],0,0),vec4(0,0,points[pointCount],0),vec4(0,0,0,1));
			console.log(num);
			num++;
			pointMat = mult(pointMat,accum_rotation[i]);
			
			
			for(var k = 0; k < points[pointCount].length; k++)
			{
				points[pointCount][k] = (pointMat[k][0])+
							            (pointMat[k][1])+
							            (pointMat[k][2])+
							            (pointMat[k][3]);
			} 
			
			pointCount++;
		}
	}
	
	var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vPosition ); 
}


	
window.onkeydown = function(event) {
    var key = event.keyCode;
    // For letters, the upper-case version of the letter is always
    // returned because the shift-key is regarded as a separate key in
    // itself.  Hence upper- and lower-case can't be distinguished.
    switch (key) {
    case 88: {
		viewerMat = mult(viewerMat, rotate(2.0, vec3(1,0,0)));
		for(var i = 0; i < viewer.length; i++)
		{
			viewer[i] = (viewerMat[i][0])+
						(viewerMat[i][1])+
						(viewerMat[i][2])+
						(viewerMat[i][3]);
		} 
		break;
	}
	case 89: {
		viewerMat = mult(viewerMat, rotate(2.0, vec3(0,1,0)));
		for(var i = 0; i < viewer.length; i++)
		{
			viewer[i] = (viewerMat[i][0])+
						(viewerMat[i][1])+
						(viewerMat[i][2])+
						(viewerMat[i][3]);
		} 
		break;
	}
	case 90: {
		viewerMat = mult(viewerMat, rotate(2.0, vec3(0,0,1)));
		for(var i = 0; i < viewer.length; i++)
		{
			viewer[i] = (viewerMat[i][0])+
						(viewerMat[i][1])+
						(viewerMat[i][2])+
						(viewerMat[i][3]);
		} 
		break;
	}
    default: return; // Skip drawing if no effective action
    }
};

