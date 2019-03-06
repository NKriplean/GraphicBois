/*
Golly-Gee Whiz points eligable things:
		   Insert reason here
		
Citations: Add if any

*/

var gl;
var canvas;

var colors = [];
var vertices = [];
var vPosition;
var modelTransform;
var bufferID;
var program;


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
	    vertices.push(t);
	};
	
	document.getElementById("drawOriginal").addEventListener("click",
	// When clicked we are done clicking in the polygon
	function(event) {
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
		
	    render();
	});
	

    //  Load shaders and initialize attribute buffers using A/S utility initShaders
	
    document.getElementById("vertReset").onclick = function(){
			modelTransform = mat3();
	};
		
	var populateColors = function(){
		for(var i = 0; i < vertices.length; i++)
		{
			var randomColor = vec4((Math.random() ), (Math.random()), (Math.random() ), 1);
			colors.push(randomColor);
			console.log(randomColor);
		}
	};

};

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
	
	gl.uniform1i(gl.getUniformLocation(program, "smooth_flag"), 1);
	
	gl.uniformMatrix3fv(gl.getUniformLocation(program, "modelTransform"),
			false,
			flatten(modelTransform));

	gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length); //Original user clicked object
	
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
    default: return; // Skip drawing if no effective action
    }
};

