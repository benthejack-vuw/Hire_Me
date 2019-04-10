import * as settings        from './settings.js'
import GPUComputeProgram    from './shaderCompute/gpuComputeProgram.js'
import {create_output_pass} from './shaderCompute/outputTextureRect.js'
import velocity_pass        from './passes/velocityPass.js'
import position_pass        from './passes/positionPass.js'
import excrete_pass         from './passes/excretePass.js'
import render_pass          from './passes/renderPass.js'

import {
  TextureLoader,
  WebGLRenderer,
  Scene,
  OrthographicCamera
}from 'three'

/*
  TO DO:
  tidy up index
  move shaders to respective pass files

  add colour absorbsion pass
  correct aspect ratio
  add interaction

  quality settings buttons or detector

  branding:
      field Logo
      github link
      cover letter popup
      Visual framing / composition
*/

(function(){

  let renderer;
  let gpu_compute_prog;
  let passes = {};

  document.addEventListener("DOMContentLoaded", function(event) {

    renderer = new WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    //renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setSize( settings.render_texture_size.x, settings.render_texture_size.y );

    document.body.appendChild( renderer.domElement );

    var colour_texture = new TextureLoader().load( 'assets/colour_gradient.jpg' );

    //create compute program and passes
    gpu_compute_prog = new GPUComputeProgram(renderer);
    passes.velocity = velocity_pass();
    passes.position = position_pass();
    passes.excrete  = excrete_pass();
    passes.excrete_a  = excrete_pass();
    passes.render     = render_pass();
    passes.output     = create_output_pass(passes.render);

    //linking pass textures

    //passes.excrete.set_uniform("positions",   passes.position.getOutputTexture());
    passes.render.set_uniform("excretions",   passes.excrete_a.getOutputTexture());
    passes.render.set_uniform("colour_map",   colour_texture);

    passes.position.set_update_function(function(){
      passes.position.set_uniform("velocities", passes.velocity.getOutputTexture());
    });

    let time = 0;
    passes.velocity.set_update_function(function(){
      passes.velocity.set_uniform("positions",  passes.position.getOutputTexture());
      passes.velocity.set_uniform("excretions", passes.excrete.getOutputTexture());
      passes.velocity.set_uniform("time",       time);
      passes.velocity.set_uniform("sniff_rotation",  3.1415926*.8 + (Math.sin(time/4)*3.14159/10.0));
      passes.velocity.set_uniform("sniff_odds",  ((Math.sin(time/3) + 1)/2.0)*0.2+0.1);
      time+=0.01;
    });

    passes.excrete.set_update_function(function(){
      passes.excrete.set_uniform("positions",   passes.position.getOutputTexture());
    });

    passes.excrete_a.set_uniform("do_alpha", true);
    passes.excrete_a.set_update_function(function(){
      passes.excrete_a.set_uniform("positions",   passes.position.getOutputTexture());
    });

    gpu_compute_prog.addPass(passes.velocity);
    gpu_compute_prog.addPass(passes.position);
    gpu_compute_prog.addPass(passes.excrete);
    gpu_compute_prog.addPass(passes.excrete_a);
    gpu_compute_prog.addPass(passes.render);
    gpu_compute_prog.addPass(passes.output);

    draw_loop();
  });


  function draw_loop() {
    gpu_compute_prog.render();
  	requestAnimationFrame( draw_loop );
  }

}())
