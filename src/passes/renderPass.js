import {
  Vector2,
  ShaderMaterial,
  NormalBlending,
  UnsignedByteType,
  OrthographicCamera
} from 'three'

import ComputePass       from '../shaderCompute/computePass.js'
import * as settings     from '../settings.js'
import {render_shader}   from '../compute_shaders'

export default function render_pass(i_velocityPass){

	var render_uniforms = {
    computedOutput:           { type: "t", value:null },
    excretions:               { type: "t", value:null },
    colour_map:               { type: "t", value:null },

    fade:                     { type: "f",  value:settings.fade_amount },
    lower_mask_bound:         { type: "f",  value:settings.lower_mask_bound },
    upper_mask_bound:         { type: "f",  value:settings.upper_mask_bound },
	};

	var render_shader_material = new ShaderMaterial( {

		uniforms:       render_uniforms,
		vertexShader:   render_shader.vert,
		fragmentShader: render_shader.frag,

		blending:       NormalBlending,
		depthTest:      false,
		transparent:    true

	});

  let render_camera = new OrthographicCamera(-settings.render_texture_size.x/2, settings.render_texture_size.x/2, settings.render_texture_size.y/2, -settings.render_texture_size.y/2, -10000, 10000);
	let render_pass = new ComputePass(settings.render_texture_size, render_shader_material, true, UnsignedByteType, undefined, render_camera);
	return render_pass;

}
