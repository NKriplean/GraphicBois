//Citation: https://stackoverflow.com/questions/17726753/get-a-random-number-between-0-0200-and-0-120-float-numbers


var gl;
var points;
var theta = 0.0;
var thetaLoc;
var tweenLoc;
var tweenLoc2;
var drawModeLoc;
var goingToInv = true;
var tweenFactor = 0.0;
var tweenFactor2 = 0.0;
var rotationDegree = radians(5.0);
var canvas;
var xCoord; 
var yCoord;
var program;
var vertices = [];
var morphVertices = [];
var colors = [];
var num = 1000; //Used in polar curve

var gVertBuff;
var gColorBuff;
var gPos;
var gCol;

var tweening = false;

var mode = 1; // 1 = mode 1 / 2 = mode 2 / 3 = mode 3


window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );
    
    //    gl = WebGLUtils.setupWebGL( canvas );  // More efficient
    gl = WebGLDebugUtils.makeDebugContext( canvas.getContext("webgl") ); // For debugging
    if ( !gl ) { alert( "WebGL isn't available" );
               }

    vertices = [           
        
		
		vec2(-1, -1), //Lines
		vec2(1, 1),
		vec2(-1, 1),
		vec2(1, 1),
		vec2(1, -1),
		vec2(1, 1),
		
		vec2(1, 1), //Tri
        vec2(2, .5),
        vec2(.6,-.3),
		
		vec2(-.75,-.75), //Square1
		vec2(-.75,-.5),
		vec2(-.5,-.5),
		vec2(-.5,-.75),
		
		vec2(.75,.75), //Square2
		vec2(.75,.5),
		vec2(.5,.5),
		vec2(.5,.75)
		
		
		
    ];
    
    colors = [
		vec4(1, 0, 0, 1), //Lines
		vec4(1, 0, 0, 1),
		vec4(1, 0, 0, 1),
		vec4(1, 0, 0, 1),
		vec4(1, 0, 0, 1),
		vec4(1, 0, 0, 1),
		//
		vec4(1, 1, 0, 1), //Tri
		vec4(1, 0, 1, 1),
		vec4(1, 1, 0, 1),
		//
		vec4(0,1,0,1), //Square1
		vec4(0,1,0,1),
		vec4(0,1,0,1),
		vec4(0,1,0,1),
		
		vec4(0,1,0,1), //Square2
		vec4(0,1,0,1),
		vec4(0,1,0,1),
		vec4(0,1,0,1)
	]
	
	//Our functions to create corresponding shapes, both the vertices and the colors.
	makeDodeca();
	makeHex();
	makePent();
	makeRibbon();
	makeVertices();
	
	morphVerticesCreation();
	
	
    //  Configure WebGL
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    //  Load shaders and initialize attribute buffers using A/S utility initShaders

    program = initShaders( gl, "vertex-shader", "fragment-shader" ); 
    gl.useProgram( program );
	
	// Load the data into the GPU using A/S flatten function

    var sBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, sBufferId );
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
	
	gVertBuff = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, gVertBuff );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(morphVertices), gl.STATIC_DRAW );
	gPos = gl.getAttribLocation( program, "gPosition" );
	gl.vertexAttribPointer( gPos, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( gPos );
	gColorBuff = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, gColorBuff );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
	gCol = gl.getAttribLocation( program, "gColor" );
	gl.vertexAttribPointer( gCol, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( gCol );
	
	thetaLoc = gl.getUniformLocation(program, "theta");
	   
    //Used for mirroring vertices in the correct viewports
	xCoord = gl.getUniformLocation(program, "xCoord");
	yCoord = gl.getUniformLocation(program, "yCoord");
	
	//Removes rendered vertices from polar curve
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
	//Resets rendered vertices for polar curve
    document.getElementById("vertReset").onclick = function(){
			num = 1000;
			mode = 1;
		};
	//Adds rendered vertices to polar curve
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
	
	document.getElementById("CLButton").onclick = function(){theta -= rotationDegree;};
	
    document.getElementById("CCButton").onclick = function(){theta += rotationDegree;};
	
	document.getElementById("RemoveCurve").onclick = function(){num = 0;}
	
	tweenLoc = gl.getUniformLocation(program, "tween");
	tweenLoc2 = gl.getUniformLocation(program, "tween2");
	drawModeLoc = gl.getUniformLocation(program, "mode");
    
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

//Produces the faded boxes on the sides of the canvas
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

function morphVerticesCreation()
{
	for(var i = 0; i < vertices.length; i++)
	{
		var vert = vec2((Math.random() * ((-1.0) - 1.0) + 1.0), (Math.random() * ((-1.0) - 1.0) + 1.0));
		console.log(vert);
		morphVertices.push(vert);
	}
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
	
	if(mode == 1)
	{
		gl.uniform1i(drawModeLoc, 1);
	}
	else if(mode == 2)
	{
		//TO BE DONE
		gl.uniform1i(drawModeLoc, 2);
		
		if (tweening) {
			tweenFactor = Math.min(tweenFactor + 0.01, 1.0);
			if (tweenFactor >= 1.0)  {
				tweening = false;
			}
		}
		else {
			tweenFactor = Math.max(tweenFactor - 0.01, 0.0);
			if (tweenFactor <= 0.0) {
				tweening = true;
			}           
		}
		gl.uniform1f(tweenLoc, tweenFactor);
		
		
	}
	else if(mode == 3)
	{
		gl.uniform1i(drawModeLoc, 3);
		if (goingToInv) {
			tweenFactor2 = Math.min(tweenFactor2 + 0.01, 1.0);
			if (tweenFactor2 >= 1.0)  {
				goingToInv = false;
			}
		}
		else {
			tweenFactor2 = Math.max(tweenFactor2 - 0.01, 0.0);
			if (tweenFactor2 <= 0.0) {
				goingToInv = true;
			}           
		}
		gl.uniform1f(tweenLoc2, tweenFactor2);
	}
	
	
	for(var i = 0; i < 4; i++)
	{
		//Switch dictates which viewport is being draw in, and how it is mirrored accordingly
		switch (i) {
			case 0 :
			{
				gl.uniform1f(xCoord, 1);
				gl.uniform1f(yCoord, 1);
			    // Get the rotation uniform to the GPU
                gl.uniform1f(thetaLoc, theta);
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
		case 'D' : //Remove vertices shortcut
		{
			if(num > 0)
			{
				num -= 1;
			}
			break;
		}
		case 'R' : //Reset shortcut
		{
			//TODO: Reset the rotation as well
			num = 1000;
			mode = 1;
			theta = 0.0;
			break;
		}
		case 'U' :
		{
			if(num < 1000) //Add vertices shortcut
			{
				num += 1;
			}
			break;
		}
		case 'L' :
		{
			theta -= rotationDegree;
			break;
		}
		case 'C' :
		{
			theta += rotationDegree;
			break;
		}
		case 'F' : 
		{
			num = 0;
			break;
		}
		case '1' :
		{
			mode = 1;
			gl.uniform1i(drawModeLoc, 1);
			break;
		}
		case '2' :
		{
			mode = 2;
			gl.uniform1i(drawModeLoc, 2);
			break;
		}
		case '3' :
		{
			mode = 3;
			gl.uniform1i(drawModeLoc, 3);
			break;
		}
    }
};

