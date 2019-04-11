import {
  Vector2,
  ShaderMaterial,
  NormalBlending,
  UnsignedByteType,
  OrthographicCamera
} from 'three'

import {vertex_passthrough} from '../shaderCompute/defaultShaders.js'
import ComputePass          from '../shaderCompute/computePass.js'

export default function render_pass(settings){

	const render_uniforms = {
    computedOutput:           { type: "t", value:null },
    excretions:               { type: "t", value:null },
    colour_map:               { type: "t", value:null },

    fade:                     { type: "f",  value:settings.fade_amount },
    lower_mask_bound:         { type: "f",  value:settings.lower_mask_bound },
    upper_mask_bound:         { type: "f",  value:settings.upper_mask_bound },
	};

	const render_shader_material = new ShaderMaterial( {

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


const render_shader = {
  vert:vertex_passthrough,
  frag:[
    "uniform sampler2D computedOutput;",
    "uniform sampler2D excretions;",
    "uniform sampler2D colour_map;",
    "uniform float fade;",
    "uniform float lower_mask_bound;",
    "uniform float upper_mask_bound;",

    "varying vec2 vUv;",

    "void main() {",
      "vec4 old_color = texture2D(computedOutput, vUv)*fade;",
      "old_color.a = old_color.a < 0.1 ? 0.0 : old_color.a;",
      "float mask = texture2D(excretions, vUv).a;",
      "mask = smoothstep(lower_mask_bound, upper_mask_bound, mask);",
      "vec4 color_out = texture2D(colour_map, vec2(vUv.x, 1.0-vUv.y));",
      "color_out.a = (mask+old_color.a);",
      "gl_FragColor = color_out;",
    "}",

  ].join( "\n" )
}
