import * as settings from "./settings.js"

/*

export const stub = {
  vert:[
  ].join( "\n" ),

  frag:[
  ].join( "\n" )
}

*/


const vertex_passthrough = [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

].join( "\n" );


export const velocity_shader = {

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

export const excrete_shader = {
  vert:[
    "uniform sampler2D positions;",
    "uniform vec2 positions_size;",
    "uniform vec2 excretion_texture_size;",
    "uniform float excrete_size;",

    "attribute float id_in;",
    "varying   float id;",

    "void main() {",
        "vec2 pixelStep = vec2(1.0/positions_size.x, 1.0/positions_size.y);",
        "vec2 texOffset = vec2(pixelStep.x/2.0, pixelStep.y/2.0);",
        "vec4 texPosition = texture2D(positions, position.xy*pixelStep.xy+texOffset.xy) * vec4(excretion_texture_size, 1.0, 1.0);",

        "vec4 mvPosition = modelViewMatrix * texPosition;",
        //  "vec4 mvPosition = modelViewMatrix * vec4(0.5,0.5,1,1);",
        "id = id_in;",
        "gl_PointSize = excrete_size;",
        "gl_Position = projectionMatrix * mvPosition;",
    "}",
  ].join( "\n" ),

  frag:[
    "uniform bool do_alpha;",
    "varying float id;",
    "void main() {",
      "float strength = (0.5-distance(gl_PointCoord, vec2(0.5,0.5)))*2.0;",
      "gl_FragColor = vec4(strength, id, 0.0, do_alpha ? strength : 1.0);",
    "}",
  ].join( "\n" )
}

export const render_shader = {
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
      //"mask = smoothstep(lower_mask_bound, upper_mask_bound, mask);",
      "vec4 color_out = texture2D(colour_map, vUv);",
      "color_out.a = mask+old_color.a;",
      "gl_FragColor = color_out;",
    "}",

  ].join( "\n" )
}
