import {
  Vector2,
  ShaderMaterial,
  NormalBlending,
  FloatType
} from 'three'

import ComputePass       from '../shaderCompute/computePass.js'
import {vertex_passthrough} from '../shaderCompute/defaultShaders.js'


export default function position_pass(settings){

	const position_uniforms = {
    computedOutput:   { type: "t", value:null },
    velocities:       { type: "t", value:null },

    positions_size:   { type: "v2", value: new Vector2(settings.particle_count_sq, settings.particle_count_sq)},
    speed:            { type: "f", value:settings.particle_speed },
	};

	const position_shader_material = new ShaderMaterial( {

		uniforms:       position_uniforms,
		vertexShader:   position_shader.vert,
		fragmentShader: position_shader.frag,

		blending:       NormalBlending,
		depthTest:      false,
		transparent:    false

	});

	const size = {x: settings.particle_count_sq, y: settings.particle_count_sq};
	let position_pass = new ComputePass(size, position_shader_material, true, FloatType);

  const position_data = initialize_position_data(settings);
  position_pass.init_data(size, position_data);

	return position_pass;
}


function initialize_position_data(settings){

  const particle_count = Math.pow(settings.particle_count_sq, 2);

  let position_data = [];
  for(let i = 0; i < particle_count; ++i){
    position_data.push(Math.random());
    position_data.push(Math.random());
    position_data.push(i/100.0);
    position_data.push(1.0);
  }

  return position_data;
}



export const position_shader = {
  vert:vertex_passthrough,
  frag:[
    "uniform sampler2D computedOutput;",
    "uniform sampler2D velocities;",

    "uniform vec2 positions_size;",
    "uniform float speed;",

    "varying vec2 vUv;",

    "void main() {",

      "vec2 pixelStep = vec2(1.0/positions_size.x, 1.0/positions_size.y);",
      "vec2 texOffset = vec2(pixelStep.x/2.0, pixelStep.y/2.0);",
      "vec2 tex       = floor(vUv*positions_size);",
      "vec2 texel_pos = tex*pixelStep+texOffset;", //webgl1 doesn't have texelfetch

      "vec2 position = texture2D(computedOutput, texel_pos).xy;",
      "vec2 velocity = texture2D(velocities,     texel_pos).xy;",
      "position += vec2(cos(velocity.x*6.2831852) * speed, sin(velocity.x*6.2831852) * speed);",
      "position.x = mod(position.x, 1.0); ",
      "position.y = mod(position.y, 1.0); ",
      "gl_FragColor = vec4(position, 0.0, 1.0);",
    "}"
  ].join( "\n" )
}
