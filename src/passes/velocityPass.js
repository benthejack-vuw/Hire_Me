import {
  Vector2,
  ShaderMaterial,
  NormalBlending,
  FloatType
} from 'three'

import ComputePass       from '../shaderCompute/computePass.js'
import * as settings     from '../settings.js'
import {vertex_passthrough} from '../shaderCompute/defaultShaders.js'

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
    velocityPass.init_data(size, velocity_data);

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



const velocity_shader = {

  vert:vertex_passthrough,
  frag:[
    "uniform sampler2D computedOutput;",
    "uniform sampler2D positions;",
    "uniform sampler2D excretions;",
    "uniform vec2 positions_size;",
    "uniform vec2 excretion_texture_size;",


    "uniform float time;",
    "uniform float sniff_rotation;",
    //"uniform int pattern;",
    "uniform float sniff_size;",
    "uniform float sniff_odds;",

		"varying vec2 vUv;",
    "const int sniff_samples_sq = "+settings.sniff_samples_sq+";",

    "vec2 rotate_around(vec2 pt, float angle, vec2 origin)",
    "{",
        "mat3 t1 = mat3( cos(angle), sin(angle), origin.x,",
                       "-sin(angle), cos(angle), origin.y,",
                       "0, 0, 1);",

        "return (vec3(pt, 1.0)*t1).xy;",
    "}",


    "float rand(vec2 seed){",
        "return fract(sin(dot(seed.xy ,vec2(12.9898,78.233))) * 43758.5453);",
    "}",

    "float rand_heading(vec2 seed, float current_heading){",
        "float v = current_heading + (rand(seed)-0.5)/10.0;",//random between -0.1 & 0.1
        "return v;",
    "}",

    "bool sameIds(float one, float two){",
        "float space = 1.0/(positions_size.x*positions_size.y);",//random between -0.1 & 0.1
        "space /= 4.0;",//random between -0.1 & 0.1
        "return one > two-space && one < two+space;",
    "}",

    "float sniffed_direction(vec2 texel_pos, float id, float current_heading){",
        "vec2 position = texture2D(positions, texel_pos).xy;",
        "vec2 actual_sniff = vec2(sniff_size, sniff_size);",
        "vec2 sample_pos = -actual_sniff;",
        "vec2 sample_step = vec2(sniff_size/float(sniff_samples_sq), sniff_size/float(sniff_samples_sq));",
        "vec2 output_uv = vec2(-1,-1);",
        "float max = -1.0;",

        "for(int i = 0; i < sniff_samples_sq; ++i){",
          "for(int j = 0; j < sniff_samples_sq ; j++){",
               "vec2 sample_uv = rotate_around(sample_pos + (vec2(i, j)*sample_step), sniff_rotation, position);",
               "vec2 sample    = texture2D(excretions, sample_uv.xy).xy;",
                "float strength = sample.x;",
                "if(!sameIds(sample.y, id) && strength > max && strength > 0.0){",
                    "max = strength;",
                    "output_uv = sample_uv;",
                "}",
          "}",
        "}",

        "if(max > -1.0){",
          "return (atan(output_uv.y - position.y, output_uv.x - position.x))/6.2831852;",
        "}else{",
          "return rand_heading(vUv + vec2(time/2.0, time) + vec2(current_heading, current_heading/2.0), current_heading);",
        "}",
    "}",

		"void main() {",

      "vec2 pixelStep = vec2(1.0/positions_size.x, 1.0/positions_size.y);",
      "vec2 texOffset = vec2(pixelStep.x/2.0, pixelStep.y/2.0);",
      "vec2 tex       = floor(vUv*positions_size);",
      "vec2 texel_pos = tex*pixelStep+texOffset;", //webgl1 doesn't have texelfetch
      "vec4 old_vals  = texture2D(computedOutput, texel_pos);",
      "float heading  = old_vals.x;",
      "float id       = old_vals.y;",

      "vec2 seed = vUv + vec2(time/2.0, time) + vec2(heading, heading/2.0);",
      "float r = rand(seed);",
      "float new_heading;",
      "if(r < sniff_odds){",
        "new_heading = sniffed_direction(texel_pos, id, heading);",
      "}else{",
        "new_heading = rand_heading(seed, heading);",
      "}",
      //"float new_heading =  rand_heading(seed2, heading);",
      "gl_FragColor = vec4(new_heading, id, 0.0, 1.0);",

		"}"
  ].join( "\n" )

}
