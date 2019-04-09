import {
  Vector2,
  ShaderMaterial,
  NormalBlending,
  FloatType
} from 'three'

import ComputePass       from '../shaderCompute/computePass.js'
import * as settings     from '../settings.js'
import {position_shader} from '../compute_shaders'


export default function position_pass(i_velocityPass){

	var position_uniforms = {
    computedOutput:   { type: "t", value:null },
    velocities:       { type: "t", value:null },

    positions_size:   { type: "v2", value: new Vector2(settings.particle_count_sq, settings.particle_count_sq)},
    speed:            { type: "f", value:settings.particle_speed },
	};

	var position_shader_material = new ShaderMaterial( {

		uniforms:       position_uniforms,
		vertexShader:   position_shader.vert,
		fragmentShader: position_shader.frag,

		blending:       NormalBlending,
		depthTest:      false,
		transparent:    false

	});

	const size = {x: settings.particle_count_sq, y: settings.particle_count_sq};
	let position_pass = new ComputePass(size, position_shader_material, true, FloatType);

  const position_data = initialize_position_data();
  position_pass.initData(size, position_data);

	return position_pass;
}


function initialize_position_data(){

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
