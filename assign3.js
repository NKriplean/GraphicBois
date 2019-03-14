/*
Golly-Gee Whiz points eligable things:
		   Insert reason here
		
Citations: Add if any

*/

var gl;
var canvas;
var seed_poly = [];
var matriceList = [];
var matIndex = 0;
var currentPoly;
var level = 8;

var mtUniform;

var colors = [];
var vertices = [];
var vPosition;
var modelTransform;
var index = 0;
var bufferID;
var program;

var isLast = false;
var isFractal = false;
var numpts = 30;

var pMatrix;
var projection;
var LEFT = -10.0;
var RIGHT = 10.0;
var BOTTOM = 0.0;
var TOP = 10.0;


window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );
    
    //    gl = WebGLUtils.setupWebGL( canvas );  // More efficient
    gl = WebGLDebugUtils.makeDebugContext( canvas.getContext("webgl") ); // For debugging
    if ( !gl ) { alert( "WebGL isn't available" );}
	
	modelTransform = mat3();
	
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
	gl.clear( gl.COLOR_BUFFER_BIT );
		
	program = initShaders( gl, "vertex-shader", "fragment-shader" ); 
	gl.useProgram( program );
	
	projection = gl.getUniformLocation( program, "projection" );
	
	
	canvas.onmousedown =
	function(event) {
	    var t;
	    // Must convert canvas pixel to world coordinate
            t  = vec2(2*event.clientX/canvas.width-1,
		      2*(canvas.height-event.clientY)/canvas.height-1);
			  console.log(t);
	    seed_poly.push(t);
	};
	
	document.getElementById("drawOriginal").addEventListener("click",
	// When clicked we are done clicking in the polygon
	function(event) {
		for(var i = 0; i < seed_poly.length; i++)
		{
			vertices.push(seed_poly[i]);
		}
	    bufferID = gl.createBuffer();
	    gl.bindBuffer( gl.ARRAY_BUFFER, bufferID );
	    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
	    vPosition = gl.getAttribLocation( program, "vPosition" );
	    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	    gl.enableVertexAttribArray( vPosition );
		
		populateColors();
		
		var cBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
	
		var vColor = gl.getAttribLocation(program, "vColor");
		gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(vColor);
		
		mtUniform = gl.getUniformLocation(program, "modelTransform");
		
	    render();
	});
	
    document.getElementById("vertReset").onclick = function(){
			modelTransform = mat3();
	};
		
	var populateColors = function(){
		for(var i = 0; i < vertices.length; i++)
		{
			var randomColor = vec4((Math.random() ), (Math.random()), (Math.random() ), 1);
			colors.push(randomColor);
		}
	};

	document.getElementById("cloneButton").addEventListener("click",
	function(event) {
		matriceList.push(modelTransform);
		modelTransform = mult(mat3(vec3(1.0,0.0,0.01),
						      vec3(0.0,1.0,0.01),
						      vec3(0.0,0.0,1.0)),
						      matriceList[0]);
	    for(var i = 0; i < seed_poly.length; i++)
		{
			vertices.push(seed_poly[i]);
			console.log(seed_poly[i]);
		}
		
	    gl.bindBuffer( gl.ARRAY_BUFFER, bufferID );
	    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
	    vPosition = gl.getAttribLocation( program, "vPosition" );
	    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	    gl.enableVertexAttribArray( vPosition );
		
		populateColors();
		
		var cBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
	
		var vColor = gl.getAttribLocation(program, "vColor");
		gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(vColor);
		
	});
	
	document.getElementById("sprayFractal").onclick = function(){
			generateFractalPoints();
	};
	
	function generateFractalPoints () {
		isFractal = true;
		var iter, t, p;
		//var oldx = 0;
		//var oldy = 0;
		var oldMat = mat3();
		//var newx, newy, p;
		var newMat;
		var cumulative_prob = [];

		//Original: cumulative_prob.push(myIFS.transformations[0].prob);
		cumulative_prob.push(myIFS.transformations[0].prob);
		for (var i = 1; i < myIFS.transformations.length; i++){
			cumulative_prob.push(cumulative_prob[i-1] +   // Make probability cumulative
					myIFS.transformations[i].prob); 

			iter = 0;
			while (iter < numpts){
			p = Math.random();
        
			// Select transformation t
			t = 0;
			//Original: while ((p > cumulative_prob[t]) && (t < myIFS.transformations.length - 1)) t++;
				while ((p > cumulative_prob[t]) && (t < matriceList.length - 1)){ 
				// Transform point by transformation t 
				newMat = mult(oldMat,matriceList[t]);
				//newx = myIFS.transformations[t].rxx*oldx
				//	+ myIFS.transformations[t].rxy*oldy
				//	+ myIFS.transformations[t].tx;
				//newy = myIFS.transformations[t].ryx*oldx
				//	+ myIFS.transformations[t].ryy*oldy
				//	+ myIFS.transformations[t].ty;

        
				// Jump around for awhile without plotting to make sure the
				// first point seen is attracted into the fractal
				if (iter > 20) {
					//vertices.push(vec2(newx, newy));
					for(var i = 0; i < seed_poly.length; i++)
					{
						vertices.push(seed_poly[i]);
					}
					populateColors();
				}
				oldMat = newMat;
				matriceList.push(oldMat);
				t++;
				iter++;
		
				}
			}
		}
	};

	document.getElementById("levelFractal").onclick = function(){
			generateFractalPointsByLevel();
	};
	
	function generateFractalPointsByLevel (seed, level) {
		isFractal = true;
		if (level > 0) {
		var i, j;
		for (j = 0; j < seed.length; j++) {
			vertices.push(seed[j]);
		}
		for (i = 0; i < myIFS.transformations.length; i++) {
			var next_seed = [];
			for (j = 0; j < seed.length; j++) {
			next_seed.push(vec2(myIFS.transformations[i].rxx*seed[j][0]
						+ myIFS.transformations[i].rxy*seed[j][1]
						+ myIFS.transformations[i].tx,
						myIFS.transformations[i].ryx*seed[j][0]
						+ myIFS.transformations[i].ryy*seed[j][1]
						+ myIFS.transformations[i].ty));
			}
			generateFractalPointsByLevel(next_seed, level - 1);
			}
		}
		
	};
	
};

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
	
	if(isFractal){
		pMatrix = ortho(LEFT,RIGHT,BOTTOM,TOP,-1.0,1.0);
		gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );
	} else {
		pMatrix = ortho(-1.0,1.0,-1.0,1.0,-1.0,1.0);
		gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );
	}
	
	gl.uniform1i(gl.getUniformLocation(program, "smooth_flag"), 1);
	
	matIndex = 0;

	for(var i = 0; i < vertices.length; i = i + seed_poly.length)
	{	
		if(matIndex > matriceList.length-1){
			isLast = true;
		} else {
			isLast = false;
		}
		var currentMatrix;
		if(isLast || matriceList.length == 0){
			currentMatrix = modelTransform;
		}
		else {
			currentMatrix = matriceList[matIndex];
		}
		for(var j = 0; j < seed_poly.length; j++ )
		{
			gl.uniformMatrix3fv(mtUniform, false, flatten(currentMatrix));
			
			var vertMat = mat3(vec3(vertices[j][0],0.0,0.0), 
			                   vec3(0.0,vertices[j][1],0.0), 
							   vec3(0.0,0.0,1.0));
			vertMat = mult(vertMat, currentMatrix);
		}
		gl.drawArrays( gl.TRIANGLE_FAN, i, seed_poly.length );
		
		matIndex++;
	}

	requestAnimFrame( render );
	
}

window.onkeydown = function(event) {
    var key = event.keyCode;
    // For letters, the upper-case version of the letter is always
    // returned because the shift-key is regarded as a separate key in
    // itself.  Hence upper- and lower-case can't be distinguished.
    switch (key) {
    case 38: { // Up arrow key -> translate polygon upward
		modelTransform = mult(mat3(vec3(1.0,0.0,0.0),
		vec3(0.0,1.0,0.02),
		vec3(0.0,0.0,1.0)),
		modelTransform);
		break;
	}
    case 40: { // Down arrow key -> translate polygon downward
		modelTransform = mult(mat3(vec3(1.0,0.0,0.0),
		vec3(0.0,1.0,-0.02),
		vec3(0.0,0.0,1.0)),
		modelTransform);
		break;
	}
    case 39: { // Right arrow key -> translate polygon to the right
		modelTransform = mult(mat3(vec3(1.0,0.0,0.02),
		vec3(0.0,1.0,0.0),
		vec3(0.0,0.0,1.0)),
		modelTransform);
		break;
	}
    case 37: { // Left arrow key -> translate polygon to the left
		modelTransform = mult(mat3(vec3(1.0,0.0,-0.02),
		vec3(0.0,1.0,0.0),
		vec3(0.0,0.0,1.0)),
		modelTransform);
		break;
	}
    case 67: { // 'c'key -> counter-clockwise rotation
		modelTransform = mult(mat3(vec3(Math.cos(radians(2)),
		-Math.sin(radians(2)),
		0.0),
		vec3(Math.sin(radians(2)),
		Math.cos(radians(2)),
		0.0),
		vec3(0.0,0.0,1.0)),
		modelTransform);
		break;
	}
    case 76: { // 'l'key -> clockwise rotation
		modelTransform = mult(mat3(vec3(Math.cos(radians(-2)),
		-Math.sin(radians(-2)),
		0.0),
		vec3(Math.sin(radians(-2)),
		Math.cos(radians(-2)),
		0.0),
		vec3(0.0,0.0,1.0)),
		modelTransform);
		break;
	}
    case 83: { // 's'key -> shrink the polygon
		modelTransform = mult(mat3(vec3(0.98,0.0,0.0),
		vec3(0.0,0.98,0.0),
		vec3(0.0,0.0,1.0)),
		modelTransform);
		break;
	}
    case 71: { // 'g'key -> enlarge the polygon
		modelTransform = mult(mat3(vec3(1.02,0.0,0.0),
		vec3(0.0,1.02,0.0),
		vec3(0.0,0.0,1.0)),
		modelTransform);
		break;
	}
	case 81: { // 'q'key -> shrink the polygon.x
		modelTransform = mult(mat3(vec3(0.98,0.0,0.0),
		vec3(0.0,1.0,0.0),
		vec3(0.0,0.0,1.0)),
		modelTransform);
		break;
	}
	case 87: { // 'w'key -> shrink the polygon.y
		modelTransform = mult(mat3(vec3(1.0,0.0,0.0),
		vec3(0.0,0.98,0.0),
		vec3(0.0,0.0,1.0)),
		modelTransform);
		break;
	}
	case 69: { // 'e'key -> enlarge the polygon.x
		modelTransform = mult(mat3(vec3(1.02,0.0,0.0),
		vec3(0.0,1.0,0.0),
		vec3(0.0,0.0,1.0)),
		modelTransform);
		break;
	}
	case 82: { // 'r'key -> enlarge the polygon.y
		modelTransform = mult(mat3(vec3(1.0,0.0,0.0),
		vec3(0.0,1.02,0.0),
		vec3(0.0,0.0,1.0)),
		modelTransform);
		break;
	}
	case 90: { //'z' key
		modelTransform = mat3();
		break;
	}
    default: return; // Skip drawing if no effective action
    }
};

