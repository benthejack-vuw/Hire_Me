export const VertexPassThrough = [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

].join( "\n" );


export const FragmentClearWithFloats = [

		"uniform vec4 clearColor;",

		"void main() {",

			"gl_FragColor = clearColor;",

		"}"

].join( "\n" );
