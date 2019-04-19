// Starting point for Assignment 5

var gl;
var program;                    // The shader program
var nRows = 50;
var nColumns = 50;

var datax = [];         // Torus x-coords
var datay = [];         // Torus y-coords
var dataz = [];         // Torus z-coords
var pointsArray = [];    // Torus points to push into vertex buffer
var texCoordsArray = []; // Texture space coordinates for the sombrero points


var texture;             // A texture object that will be
                         // associated to the uniform texture
                         // sampler in the fragment shader

var displayType = 0;	 // Uniform to decide display type
var displayTypeLoc;
var multiplierLoc;
var fColor;              // A uniform variable used to pass a color vector to shader

const black = vec4(0.0, 0.0, 0.0, 1.0);
const red = vec4(1.0, 0.0, 0.0, 1.0);

////////   Viewing parameters changed by various buttons  /////////////
var near = -10;
var far = 10;
var radius = 6.0;
var theta  = 0.0;
var phi    = 0.0;
var rotation_by_5_deg = 5.0 * Math.PI/180.0;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);
var left = -1.0;
var right = 1.0;
var ytop = 1.0;
var bottom = -1.0;
var multiplier = 10.0;
////////   End viewing parameters /////////////

// Uniforms for the Angel/Shreiner viewing and projection utilities
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

// Compute vertex and texture coords for torus
function computeTorus() {
    for( var i = 0; i <= nRows; ++i ) {
        datax.push( [] );
        datay.push( [] );
        dataz.push( [] );
        var u = 2.0 * Math.PI * (i/nRows);
        
        for( var j = 0; j <= nColumns; ++j ) {
            var v = 2.0 * Math.PI * (j/nColumns);
            datax[i].push((0.5 + 0.25 * Math.cos(v)) * Math.sin(u));
            datay[i].push((0.5 + 0.25 * Math.cos(v)) * Math.cos(u));
            dataz[i].push(0.25 * Math.sin(v));
        }
    }

    for(i=0; i<nRows; i++) {
        for(j=0; j<nColumns;j++) {
            pointsArray.push( vec4(datax[i][j], datay[i][j], dataz[i][j],1.0));
            texCoordsArray.push( vec2(2*i/nRows-1, 2*j/nColumns-1) );
            pointsArray.push( vec4(datax[i+1][j], datay[i+1][j], dataz[i+1][j], 1.0));
            texCoordsArray.push( vec2(2*(i+1)/nRows-1, 2*j/nColumns-1)); 
            pointsArray.push( vec4(datax[i+1][j+1], datay[i+1][j+1], dataz[i+1][j+1], 1.0));
            texCoordsArray.push( vec2(2*(i+1)/nRows-1, 2*(j+1)/nColumns-1));
            pointsArray.push( vec4(datax[i][j+1], datay[i][j+1], dataz[i][j+1], 1.0));
            texCoordsArray.push( vec2(2*i/nRows-1, 2*(j+1)/nColumns-1) );
        }
    }
}

// This function is called to associate an image with a texture
// WebGL functions are similar to those used in JOGL
function configureTexture(image) {
    texture = gl.createTexture();
    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, texture );
    // Associate this texture with the uniform in the fragment shader
    gl.uniform1i( gl.getUniformLocation(program, "texture"), 0); 
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
                  gl.UNSIGNED_BYTE, image);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
}

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    computeTorus();
    
    // Enable depth testing and polygon offset
    // So lines will be in front of filled triangles
    
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 2.0);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Vertex buffer
    var vBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    // Texture coordinate buffer
    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    // Get locations of uniforms
    fColor = gl.getUniformLocation(program, "fColor");
    displayTypeLoc = gl.getUniformLocation(program, "displayType"); 
	multiplierLoc = gl.getUniformLocation(program, "multiplier");
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    // Load the image file with the steganographic message
    var image = new Image();
    image.onload = function() { 
        configureTexture( image );
    };
    image.crossOrigin = "anonymous";
    image.src = "mandrill_with_message512.bmp";

    // Link the image to all the necessary texture params
    configureTexture( image );

    // buttons for moving viewer, changing size, and toggling display

    document.getElementById("Button1").onclick = function(){near  *= 1.02; far *= 1.02;};
    document.getElementById("Button2").onclick = function(){near *= 0.98; far *= 0.98;};
    document.getElementById("Button3").onclick = function(){radius *= 1.1;};
    document.getElementById("Button4").onclick = function(){radius *= 0.9;};
    document.getElementById("Button5").onclick = function(){theta += rotation_by_5_deg;};
    document.getElementById("Button6").onclick = function(){theta -= rotation_by_5_deg;};
    document.getElementById("Button7").onclick = function(){phi += rotation_by_5_deg;};
    document.getElementById("Button8").onclick = function(){phi -= rotation_by_5_deg;};
    document.getElementById("Button9").onclick = function(){left  *= 0.9; right *= 0.9;};
    document.getElementById("Button10").onclick = function(){left *= 1.1; right *= 1.1;};
    document.getElementById("Button11").onclick = function(){ytop  *= 0.9; bottom *= 0.9;};
    document.getElementById("Button12").onclick = function(){ytop *= 1.1; bottom *= 1.1;};
	document.getElementById("Button13").onclick = function(){multiplier = multiplier * 10.0;};
	document.getElementById("Button14").onclick = function(){multiplier = multiplier * 10.0;};
    document.getElementById("displayTypeMenu").addEventListener("click",
             function (event) {
               displayType = document.getElementById("displayTypeMenu").selectedIndex;
             });
    render();
};


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var eye = vec3( radius*Math.sin(theta)*Math.cos(phi), 
                    radius*Math.sin(theta)*Math.sin(phi),
                    radius*Math.cos(theta));
    
    modelViewMatrix = lookAt( eye, at, up );
    projectionMatrix = ortho( left, right, bottom, ytop, near, far );
    
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniform1i(displayTypeLoc, displayType);
	gl.uniform1f(multiplierLoc, multiplier);
    
    // In initial display draw each quad as two filled red triangles
    // and then as black line loop
    
    for(var i=0; i<pointsArray.length; i+=4) { 
        gl.uniform4fv(fColor, flatten(red));
        gl.drawArrays( gl.TRIANGLE_FAN, i, 4 );
        // When in red or gradient display, we draw the grid lines in black
        if (displayType === 0 || displayType === 2) {
            gl.uniform4fv(fColor, flatten(black));
            gl.drawArrays( gl.LINE_LOOP, i, 4 );
        }
    }
    requestAnimFrame(render);
}

