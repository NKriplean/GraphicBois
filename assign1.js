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
        vec2(.6,-.3),
		
		vec2(-.75,-.75),
		vec2(-.75,-.5),
		vec2(-.5,-.5),
		vec2(-.5,-.75),
		
		vec2(.75,.75),
		vec2(.75,.5),
		vec2(.5,.5),
		vec2(.5,.75)
		
		
		
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
		vec4(1, 0, 1, 1),
		vec4(1, 1, 0, 1),
		//
		vec4(0,1,0,1),
		vec4(0,1,0,1),
		vec4(0,1,0,1),
		vec4(0,1,0,1),
		
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
	
	makeDodeca();
	makeHex();
	makePent();
	makeRibbon();
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
	
	document.getElementById("vertDown").onclick = function(){
		if(num > 0)
		{
			num -= 1;
		}
		else if (num === 0)
		{
			document.getElementById("vertDown").disable = true;
		}
		else
		{
			document.getElementById("vertDown").disable = false;
		}
	};
    document.getElementById("vertReset").onclick = function(){num = 1000;};
    document.getElementById("vertUp").onclick = function(){
		if(num < 1000)
		{
			num += 1;
		}
		else if (num === 1000)
		{
			document.getElementById("vertUp").disable = true;
		}
		else
		{
			document.getElementById("vertUp").disable = false;
		}
	};
    
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
    vertices.push(vec2( 0.125, 0.0));
    vertices.push(vec2( 0.125 * Math.cos(radians(sweepAngle)), 0.125 * Math.sin(radians(sweepAngle))));
    vertices.push(vec2( 0.125 * Math.cos(2.0 * radians(sweepAngle)), 0.125 * Math.sin(2.0 * radians(sweepAngle))));
    vertices.push(vec2( 0.125 * Math.cos(3.0 * radians(sweepAngle)), 0.125 * Math.sin(3.0 * radians(sweepAngle))));
    vertices.push(vec2( 0.125 * Math.cos(4.0 * radians(sweepAngle)), 0.125 * Math.sin(4.0 * radians(sweepAngle))));
	
	colors.push(vec4(1,0,1,1));
	colors.push(vec4(1,1,1,1));
	colors.push(vec4(1,0,1,1));
	colors.push(vec4(1,1,1,1));
	colors.push(vec4(1,0,1,1));
	
    
}

function makeHex()
{
	var sweepAngle = 60.0; // Use radians function from Angel's MV library to convert
    vertices.push(vec2( 0.25, 0.0));
    vertices.push(vec2( 0.25 * Math.cos(radians(sweepAngle)), 0.25 * Math.sin(radians(sweepAngle))));
    vertices.push(vec2( 0.25 * Math.cos(2.0 * radians(sweepAngle)), 0.25 * Math.sin(2.0 * radians(sweepAngle))));
    vertices.push(vec2( 0.25 * Math.cos(3.0 * radians(sweepAngle)), 0.25 * Math.sin(3.0 * radians(sweepAngle))));
    vertices.push(vec2( 0.25 * Math.cos(4.0 * radians(sweepAngle)), 0.25 * Math.sin(4.0 * radians(sweepAngle))));
	vertices.push(vec2( 0.25 * Math.cos(5.0 * radians(sweepAngle)), 0.25 * Math.sin(5.0 * radians(sweepAngle))));
	
	colors.push(vec4(1,1,0,1));
	colors.push(vec4(0,1,1,1));
	colors.push(vec4(1,1,0,1));
	colors.push(vec4(0,1,1,1));
	colors.push(vec4(1,1,0,1));
	colors.push(vec4(0,1,1,1));
	
    
}

function makeDodeca()
{
	var sweepAngle = 18.0; // Use radians function from Angel's MV library to convert
    vertices.push(vec2( 0.5, 0.0));
    vertices.push(vec2( 0.5 * Math.cos(radians(sweepAngle)), 0.5 * Math.sin(radians(sweepAngle))));
    vertices.push(vec2( 0.5 * Math.cos(2.0 * radians(sweepAngle)), 0.5 * Math.sin(2.0 * radians(sweepAngle))));
    vertices.push(vec2( 0.5 * Math.cos(3.0 * radians(sweepAngle)), 0.5 * Math.sin(3.0 * radians(sweepAngle))));
    vertices.push(vec2( 0.5 * Math.cos(4.0 * radians(sweepAngle)), 0.5 * Math.sin(4.0 * radians(sweepAngle))));
    vertices.push(vec2( 0.5 * Math.cos(5.0 * radians(sweepAngle)), 0.5 * Math.sin(5.0 * radians(sweepAngle))));
    vertices.push(vec2( 0.5 * Math.cos(6.0 * radians(sweepAngle)), 0.5 * Math.sin(6.0 * radians(sweepAngle))));
    vertices.push(vec2( 0.5 * Math.cos(7.0 * radians(sweepAngle)), 0.5 * Math.sin(7.0 * radians(sweepAngle))));
	vertices.push(vec2( 0.5 * Math.cos(8.0 * radians(sweepAngle)), 0.5 * Math.sin(8.0 * radians(sweepAngle))));
    vertices.push(vec2( 0.5 * Math.cos(9.0 * radians(sweepAngle)), 0.5 * Math.sin(9.0 * radians(sweepAngle))));
    vertices.push(vec2( 0.5 * Math.cos(10.0 * radians(sweepAngle)), 0.5 * Math.sin(10.0 * radians(sweepAngle))));
    vertices.push(vec2( 0.5 * Math.cos(11.0 * radians(sweepAngle)), 0.5 * Math.sin(11.0 * radians(sweepAngle))));
    vertices.push(vec2( 0.5 * Math.cos(12.0 * radians(sweepAngle)), 0.5 * Math.sin(12.0 * radians(sweepAngle))));
    vertices.push(vec2( 0.5 * Math.cos(13.0 * radians(sweepAngle)), 0.5 * Math.sin(13.0 * radians(sweepAngle))));
	vertices.push(vec2( 0.5 * Math.cos(14.0 * radians(sweepAngle)), 0.5 * Math.sin(14.0 * radians(sweepAngle))));
    vertices.push(vec2( 0.5 * Math.cos(15.0 * radians(sweepAngle)), 0.5 * Math.sin(15.0 * radians(sweepAngle))));
    vertices.push(vec2( 0.5 * Math.cos(16.0 * radians(sweepAngle)), 0.5 * Math.sin(16.0 * radians(sweepAngle))));
    vertices.push(vec2( 0.5 * Math.cos(17.0 * radians(sweepAngle)), 0.5 * Math.sin(17.0 * radians(sweepAngle))));
	vertices.push(vec2( 0.5 * Math.cos(18.0 * radians(sweepAngle)), 0.5 * Math.sin(18.0 * radians(sweepAngle))));
    vertices.push(vec2( 0.5 * Math.cos(19.0 * radians(sweepAngle)), 0.5 * Math.sin(19.0 * radians(sweepAngle))));
	
	colors.push(vec4(1,0,0,1));
	colors.push(vec4(0,0,0,1));
	colors.push(vec4(1,0,0,1));
	colors.push(vec4(0,0,0,1));
	colors.push(vec4(1,0,0,1));
	colors.push(vec4(0,0,0,1));
	colors.push(vec4(1,0,0,1));
	colors.push(vec4(0,0,0,1));
	colors.push(vec4(1,0,0,1));
	colors.push(vec4(0,0,0,1));
	colors.push(vec4(1,0,0,1));
	colors.push(vec4(0,0,0,1));
	colors.push(vec4(1,0,0,1));
	colors.push(vec4(0,0,0,1));
	colors.push(vec4(1,0,0,1));
	colors.push(vec4(0,0,0,1));
	colors.push(vec4(1,0,0,1));
	colors.push(vec4(0,0,0,1));
	colors.push(vec4(1,0,0,1));
	colors.push(vec4(0,0,0,1));
	
	
    
}

function makeRibbon(){
	vertices.push(vec2(-1.-1));
	colors.push(vec4(1,0,0,1));
	var colorChange = 0;
	for(var i = -.75; i <= 1; i +=.25){
		vertices.push(vec2(-.75,i));
		vertices.push(vec2(-1,i));
		
		colors.push(vec4(colorChange,0,0,1));
		colors.push(vec4(0,0,colorChange,1));
		colorChange+=.125
		
	}
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
	
	for(var i = 0; i < 4; i++)
	{
		switch (i) {
			case 0 :
			{
				gl.uniform1f(xCoord, 1);
				gl.uniform1f(yCoord, 1);
				gl.uniform1i(gl.getUniformLocation(program, "smooth_flag"), 1);
				gl.viewport(0, 0, canvas.width/2, canvas.height/2);
				break;
			}
			case 1 :
			{
				gl.uniform1f(xCoord, 1);
				gl.uniform1f(yCoord, -1);
				gl.viewport(0, canvas.height/2, canvas.width/2, canvas.height/2);
				break;
			}
			case 2 :
			{
				gl.uniform1f(xCoord, -1);
				gl.uniform1f(yCoord, -1);
				gl.viewport(canvas.width/2, canvas.height/2, canvas.width/2, canvas.height/2);
				break;
			}
			case 3 :
			{
				gl.uniform1f(xCoord, -1);
				gl.uniform1f(yCoord, 1);
				gl.viewport(canvas.width/2, 0, canvas.width/2, canvas.height/2);
				break;
			}
		}
		gl.drawArrays(gl.LINES, 0, 6); //Lines
		gl.drawArrays(gl.TRIANGLES, 6, 3); //Tri
		gl.drawArrays(gl.TRIANGLE_FAN, 9, 4); //Square1
		gl.drawArrays(gl.TRIANGLE_FAN, 13, 4); //Square2
		gl.drawArrays(gl.TRIANGLE_FAN, 17, 20); //Dodeca
		gl.drawArrays(gl.TRIANGLE_FAN, 37, 6); //Hexa
		gl.drawArrays(gl.TRIANGLE_FAN, 43, 5); //Penta
		gl.drawArrays(gl.TRIANGLE_STRIP, 48, 17 ); //Ribbon
		gl.drawArrays(gl.LINE_LOOP, vertices.length-num, num);
	}
	
	requestAnimFrame( render );
	
}

window.onkeydown = function(event) {
    var key = String.fromCharCode(event.keyCode);
    // For letters, the upper-case version of the letter is always
    // returned because the shift-key is regarded as a separate key in
    // itself.  Hence upper- and lower-case can't be distinguished.
    switch (key) {
		case 'D' :
		{
			if(num > 0)
			{
				num -= 1;
			}
			break;
		}
		case 'R' :
		{
			num = 1000;
			break;
		}
		case 'U' :
		{
			if(num < 1000)
			{
				num += 1;
			}
			break;
		}
    }
};

