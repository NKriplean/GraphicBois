var gl;
var points;
///////////////////////////////////////////////
//var scaleLoc;
var canvas;
var xCoord;
var yCoord;
var program;
var vertices = [];
var colors = [];
var num = 1000;


window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );
    
    //    gl = WebGLUtils.setupWebGL( canvas );  // More efficient
    gl = WebGLDebugUtils.makeDebugContext( canvas.getContext("webgl") ); // For debugging
    if ( !gl ) { alert( "WebGL isn't available" );
               }

    // Four 2D Vertices using Angel/Shreiner utility class vac2
    vertices = [           
        
		
		vec2(-1, -1),
		vec2(1, 1),
		vec2(-1, 1),
		vec2(1, 1),
		vec2(1, -1),
		vec2(1, 1),
		
		vec2(1, 1),
        vec2(2, .5),
        vec2(0,0),
		
		vec2(-.75,-.75),
		vec2(-.75,-.5),
		vec2(-.5,-.5),
		vec2(-.5,-.75)
		
    ];
    
    colors = [
		vec4(1, 0, 0, 1),
		vec4(1, 0, 0, 1),
		vec4(1, 0, 0, 1),
		vec4(1, 0, 0, 1),
		vec4(1, 0, 0, 1),
		vec4(1, 0, 0, 1),
		//
		vec4(1, 1, 0, 1),
		vec4(1, 1, 0, 1),
		vec4(1, 1, 0, 1),
		//
		vec4(0,1,0,1),
		vec4(0,1,0,1),
		vec4(0,1,0,1),
		vec4(0,1,0,1)
	]
	
	
    //  Configure WebGL
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    //  Load shaders and initialize attribute buffers using A/S utility initShaders

    program = initShaders( gl, "vertex-shader", "fragment-shader" ); 
    gl.useProgram( program );

    // Load the data into the GPU using A/S flatten function
	
	makePent();
	makeVertices();

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW ); 
                                                                         

    // Associate our shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer(
        vPosition, // Specifies the index of the generic vertex attribute to be modified.
        2,         // Specifies the number of components per generic vertex attribute. 
                   // Must be 1, 2, 3, or 4. 
        gl.FLOAT,  // Specifies the data type of each component in the array. 
            // GL_BYTE, GL_UNSIGNED_BYTE, GL_SHORT, GL_UNSIGNED_SHORT, GL_FIXED, or GL_FLOAT. 
        false,     // Specifies whether fixed-point data values should be normalized (GL_TRUE) 
            // or converted directly as fixed-point values (GL_FALSE) when they are accessed.
        0,         // Specifies the byte offset between consecutive generic vertex attributes. 
            // If stride is 0, the generic vertex attributes are understood 
            // to be tightly packed in the array.
        0          // Specifies a pointer to the first component 
            // of the first generic vertex attribute in the array.
                          );

	gl.enableVertexAttribArray( vPosition ); 
						  
    var cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
	
	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);
	
	
	   
    /////////////////////////////////////////////////
	xCoord = gl.getUniformLocation(program, "xCoord");
	yCoord = gl.getUniformLocation(program, "yCoord");
	
	document.getElementById("vertDown").onclick = function(){num -= 10;};
    document.getElementById("vertReset").onclick = function(){num = 1000;};
    
    
    render();
};

function makeVertices()
{
	const SCALE = .75;
	//r=sin^2(2.4theta)+cos^4(2.4theta)
	
	var i, fact, sinVar, cosVar, radius, theta, x, y;
	
	fact = (10 * Math.PI) / num;
	for(i = 0; i < num; ++i){
		theta = fact * i;
		sinVar = Math.sin(2.4*theta)*Math.sin(2.4*theta);
		cosVar = Math.cos(2.4*theta)*Math.cos(2.4*theta)*Math.cos(2.4*theta)*Math.cos(2.4*theta);
		radius = sinVar + cosVar;
		x =  SCALE * Math.cos(theta) * radius;
		y =  SCALE * Math.sin(theta) * radius;
		vertices.push(vec2(x,y));
	}
	
	for(var i = 0; i < num; i++)
	{
		colors.push(vec4(0, 0, 1, 1));
	}
}

function makePent()
{
	var sweepAngle = 72.0; // Use radians function from Angel's MV library to convert
    vertices.push(vec2( 0.5, 0.0));
    vertices.push(vec2( 0.5 * Math.cos(radians(sweepAngle)), 0.5 * Math.sin(radians(sweepAngle))));
    vertices.push(vec2( 0.5 * Math.cos(2.0 * radians(sweepAngle)), 0.5 * Math.sin(2.0 * radians(sweepAngle))));
    vertices.push(vec2( 0.5 * Math.cos(3.0 * radians(sweepAngle)), 0.5 * Math.sin(3.0 * radians(sweepAngle))));
    vertices.push(vec2( 0.5 * Math.cos(4.0 * radians(sweepAngle)), 0.5 * Math.sin(4.0 * radians(sweepAngle))));
	
	colors.push(vec4(1,0,1,1));
	colors.push(vec4(1,0,1,1));
	colors.push(vec4(1,0,1,1));
	colors.push(vec4(1,0,1,1));
	colors.push(vec4(1,0,1,1));
	
    
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
	
	gl.uniform1f(xCoord, 1);
	gl.uniform1f(yCoord, 1);
	gl.uniform1i(gl.getUniformLocation(program, "smooth_flag"), 1);

	gl.viewport(0, 0, canvas.width/2, canvas.height/2);
	gl.drawArrays(gl.LINES, 0, 6);
	gl.drawArrays(gl.TRIANGLES, 6, 3);
	gl.drawArrays(gl.TRIANGLE_FAN, 9, 4);
	gl.drawArrays(gl.TRIANGLE_FAN, 13, 5);
	gl.drawArrays(gl.LINE_LOOP, vertices.length-num, num);
	
	////////////////////////////////////////////////////////////////
	gl.uniform1f(xCoord, 1);
	gl.uniform1f(yCoord, -1);
	
	gl.viewport(0, canvas.height/2, canvas.width/2, canvas.height/2);
	gl.drawArrays(gl.LINES, 0, 6);
	gl.drawArrays(gl.TRIANGLES, 6, 3);
	gl.drawArrays(gl.TRIANGLE_FAN, 9, 4);
	gl.drawArrays(gl.TRIANGLE_FAN, 13, 5);
	gl.drawArrays(gl.LINE_LOOP, vertices.length-num, num);
	
	///////////////////////////////////////////////////////////////
	gl.uniform1f(xCoord, -1);
	gl.uniform1f(yCoord, -1);
	
	gl.viewport(canvas.width/2, canvas.height/2, canvas.width/2, canvas.height/2);
	gl.drawArrays(gl.LINES, 0, 6);
	gl.drawArrays(gl.TRIANGLES, 6, 3);
	gl.drawArrays(gl.TRIANGLE_FAN, 9, 4);
	gl.drawArrays(gl.TRIANGLE_FAN, 13, 5);
	gl.drawArrays(gl.LINE_LOOP, vertices.length-num, num);
	
	////////////////////////////////////////////////////////////////////
	gl.uniform1f(xCoord, -1);
	gl.uniform1f(yCoord, 1);
	
	gl.viewport(canvas.width/2, 0, canvas.width/2, canvas.height/2);
	gl.drawArrays(gl.LINES, 0, 6);
	gl.drawArrays(gl.TRIANGLES, 6, 3);
	gl.drawArrays(gl.TRIANGLE_FAN, 9, 4);
	gl.drawArrays(gl.TRIANGLE_FAN, 13, 5);
	gl.drawArrays(gl.LINE_LOOP, vertices.length-num, num);
	
	requestAnimFrame( render );
}

window.onkeydown = function(event) {
    var key = String.fromCharCode(event.keyCode);
    // For letters, the upper-case version of the letter is always
    // returned because the shift-key is regarded as a separate key in
    // itself.  Hence upper- and lower-case can't be distinguished.
    switch (key) {
    case 'D' :
	num -= 10;
	break;
    case 'R' :
	num = 1000;
	break;
    }
};

