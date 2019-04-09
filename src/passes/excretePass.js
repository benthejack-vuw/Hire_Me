import {
  Vector2,
  ShaderMaterial,
  NormalBlending,
  FloatType,
  Geometry,
  BufferGeometry,
  Scene,
  Color,
  OrthographicCamera,
  Points,
  Vector3,
  BufferAttribute
} from 'three'

import ComputePass       from '../shaderCompute/computePass.js'
import * as settings     from '../settings.js'
import {excrete_shader}  from '../compute_shaders'

export default function excrete_pass(i_velocityPass){

	const excrete_uniforms = {
    computedOutput:           { type: "t", value: null },
    positions:                { type: "t", value: null },

    do_alpha:                 { type: "f",  value: false },
    positions_size:           { type: "v2", value: new Vector2(settings.particle_count_sq, settings.particle_count_sq)},
    excretion_texture_size:   { type: "v2", value: new Vector2(settings.render_texture_size.x, settings.render_texture_size.y)},
    excrete_size:             { type: "f",  value: settings.particle_size }
	};

	const excrete_shader_material = new ShaderMaterial( {

		uniforms:       excrete_uniforms,
		vertexShader:   excrete_shader.vert,
		fragmentShader: excrete_shader.frag,

		blending:       NormalBlending,
		depthTest:      true,
		transparent:    true

	});


  let  excrete_scene = new Scene();
	let  excrete_camera = new OrthographicCamera(0, settings.render_texture_size.x, settings.render_texture_size.y, 0, -10000, 10000);
	excrete_camera.position.z = 100;

  const excrete_geometry = generate_output_geometry();

  const particleSystem = new Points( excrete_geometry, excrete_shader_material );
  excrete_scene.add( particleSystem );

  let excrete_output_scene = new ComputePass(settings.render_texture_size, excrete_shader_material, false, FloatType, excrete_scene, excrete_camera);
	return excrete_output_scene;
}

function generate_output_geometry(){

  let   output_geometry  = new BufferGeometry();
  const particle_count = Math.pow(settings.particle_count_sq,2);
  var   vertices         = new Float32Array(particle_count*3);
  var   ids              = new Float32Array(particle_count);

	for(var i = 0; i < particle_count; ++i){
		vertices[i*3]     = i%settings.particle_count_sq;
    vertices[i*3 + 1] = Math.floor(i/settings.particle_count_sq)
    vertices[i*3 + 2] = 0;
    ids[i] = (i/(particle_count+0.0));
	}

  output_geometry.addAttribute( 'position', new BufferAttribute( vertices, 3 ) );
  output_geometry.addAttribute( 'id_in',    new BufferAttribute( ids, 1 ) );

  return output_geometry;
}
