/*
Golly-Gee Whiz points eligable things:
		   We generate random colors for each vertice in every polygon. This includes the fractal generated vertices as well.
		   
		
Citations: None

*/

var gl;
var canvas;
var seed_poly = [];
var matriceList = [];
var matIndex = 0;
var level = 8;

var mtUniform;

var colors = [];
var vertices = [];
var vPosition;
var modelTransform;
var bufferID;
var program;

var isLast = false;
var isFractal = false;
var numpts = 300;


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
		matriceList.push(modelTransform);
		var matListLength = matriceList.length;
		var iter, t, p;
		var oldMat = mat3();
		var newMat;
		
		iter = 0;
		while (iter < numpts){
			console.log("In first loop");
			p = Math.random();
			// Select transformation t
			t = 0;
			while ((t < matListLength)){ 
				console.log("In second loop");
				// Transform point by transformation t 
				newMat = mult(oldMat,matriceList[t]);
				console.log(t);
				t++;
				if (iter > 20) {
					for(var i = 0; i < seed_poly.length; i++) 
					{
						console.log("In third loop");
						vertices.push(seed_poly[i]);
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
				}
				oldMat = newMat;
				matriceList.push(oldMat);
				console.log(oldMat);
				iter++;
			}
		}	
	};

	document.getElementById("levelFractal").onclick = function(){
			matriceList.push(modelTransform);
			console.log("Level Button pressed");
			generateFractalPointsByLevel(seed_poly,level);
	};
	
	function generateFractalPointsByLevel (seed, level) {
		isFractal = true;
		var x;
		var y;
		
		if (level > 0) {
		var i, j;
		for (j = 0; j < seed.length; j++) {
			vertices.push(seed[j]);
		}
		for (i = 0; i < matriceList.length; i++) {
			var next_seed = [];
			for (j = 0; j < seed.length; j++) {
				x = seed[j][0];
				y = seed[j][1];
				x = (x * matriceList[i][0][0]) + (y * matriceList[i][0][1]) + matriceList[i][0][2];
				y = (x * matriceList[i][1][0]) + (y * matriceList[i][1][1]) + matriceList[i][1][2];
				var vecToBeAdded = vec2(x,y);
				next_seed.push(vecToBeAdded);
			}
			generateFractalPointsByLevel(next_seed, level - 1);
		}
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
		
	};
	
	document.getElementById("ifsButton").onclick = function(){
		matriceList.push(modelTransform);
		var endMat = mat3();
		for(var i = 0; i < matriceList.length; i++){
			endMat = mult(endMat,matriceList[i]);
		}
		console.log(endMat[0][0] + " rxx");
		console.log(endMat[0][1] + " rxy");
		console.log(endMat[0][2] + " tx");
		console.log(endMat[1][0] + " ryx");
		console.log(endMat[1][1] + " ryy");
		console.log(endMat[1][2] + " ty");
		
	}
	
};

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
	
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
	case 187: {
		level++;
	}
	case 189: {
		level--;
	}
    default: return; // Skip drawing if no effective action
    }
};

