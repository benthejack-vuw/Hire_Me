import {
  Vector2,
  ShaderMaterial,
  NormalBlending,
  FloatType
} from 'three'

import ComputePass       from '../shaderCompute/computePass.js'
import * as settings     from '../settings.js'
import {velocity_shader} from '../compute_shaders'

/*s
  TODO: update function that increments time shader variable
*/

export default function velocity_pass(){

    const velocity_uniforms = {
      computedOutput:           { type: "t", value:null },
      positions:                { type: "t", value:null },
      excretions:               { type: "t", value:null },

      excretion_texture_size:   { type: "v2", value: new Vector2(settings.render_texture_size.x, settings.render_texture_size.y)},
      positions_size:           { type: "v2", value: new Vector2(settings.particle_count_sq, settings.particle_count_sq)},
      time:                     { type: "f", value:0.0 },
      sniff_size:               { type: "f", value:settings.sniff_size },
      sniff_odds:               { type: "f", value:settings.sniff_odds },
      sniff_rotation:           { type: "f", value:3.1415926*.7 }
    };

    const velocitiy_shader_material = new ShaderMaterial( {
      uniforms:       velocity_uniforms,
      vertexShader:   velocity_shader.vert,
      fragmentShader: velocity_shader.frag,

      blending:       NormalBlending,
      depthTest:      false,
      transparent:    false
    });

    const size = {x: settings.particle_count_sq, y: settings.particle_count_sq};
    let velocityPass = new ComputePass(size, velocitiy_shader_material, true, FloatType);

    const velocity_data = initialize_random_headings();
    velocityPass.initData(size, velocity_data);

    return velocityPass;
}

function initialize_random_headings(){

  const particle_count = Math.pow(settings.particle_count_sq, 2);
  const velocity_data = [];

  for(let i = 0; i < particle_count; ++i){
    velocity_data.push(Math.random());
    velocity_data.push((i/(particle_count+0.0)));
    velocity_data.push(0.0);
    velocity_data.push(1.0);
  }

  return velocity_data;

}
