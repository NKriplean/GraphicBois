var gl;
var points;

window.onload = function init(){
    var canvas = document.getElementById( "gl-canvas" );
    
    //    gl = WebGLUtils.setupWebGL( canvas );  // More efficient
    gl = WebGLDebugUtils.makeDebugContext( canvas.getContext("webgl") ); // For debugging
    if ( !gl ) { alert( "WebGL isn't available" );
               }

    var vertices = [           
		vec2(-1,-1),
		vec2(1,1),
		vec2(-1,1),
		vec2(1,-1),
		vec2(0,1),
		vec2(0,-1),
		vec2(-1,0),
		vec2(1,0),
		
		vec2(-1,-1),
		vec2(-1,1),
		vec2(1,1),
		vec2(1,-1)
		
    ];
    
    
    //  Configure WebGL
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    //  Load shaders and initialize attribute buffers using A/S utility initShaders

    var program = initShaders( gl, "vertex-shader", "fragment-shader" ); 
    gl.useProgram( program );

    // Load the data into the GPU using A/S flatten function

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
    
    render();
};

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.LINES, 0, 8 );
	gl.viewport(0,0, canvas.width/2, canvas.height/2);
	gl.drawArrays( gl.TRIANGLE_FAN, 8, 4 );
}
