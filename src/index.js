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
    DONE -------- move shaders to respective pass files
    add colour absorbsion pass
    correct aspect ratio
    add interaction
    background adjustment

    DONE -------- update computepass with a link_pass_to_uniform function
    break shaderCompute library off into its own NPM package
        Tidy up codebase & tie up loose ends
        Fix compute pass constructor to have less arguments
        Documentation
        Examples

    quality settings buttons or detector

    branding:
        field logo
        github link
        cover letter popup
        Visual framing / composition
        Github readme & npm package docs
        Process document & video?

    contact office & find out person in charge of hiring
*/

(function(){


  document.addEventListener("DOMContentLoaded", setup);


  function setup(){

      let renderer = set_up_threeJS();
      let gpu_compute_prog  = new GPUComputeProgram(renderer);
      let passes = create_passes();

      add_passes_to_gpuProg(gpu_compute_prog, passes);
      set_pass_uniforms(passes);
      set_pass_update_functions(passes);

      start_draw_loop(gpu_compute_prog);
  }


  function set_up_threeJS(){
    let renderer = new WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );
    return renderer;
  }


  function create_passes(){
    let passes = {};
    passes.velocity   = velocity_pass();
    passes.position   = position_pass();
    passes.excrete    = excrete_pass();
    passes.excrete_a  = excrete_pass();
    passes.render     = render_pass();
    passes.output     = create_output_pass(passes.render);
    return passes;
  }


  //this is done manually instead of iterating over the keys for testing.
  //this way you can disable a pass or two when you're debugging other passes.
  //add them in the order you need them to execute.
  function add_passes_to_gpuProg(gpu_compute_prog, passes){
    gpu_compute_prog.addPass(passes.velocity);
    gpu_compute_prog.addPass(passes.position);
    gpu_compute_prog.addPass(passes.excrete);
    gpu_compute_prog.addPass(passes.excrete_a);
    gpu_compute_prog.addPass(passes.render);
    gpu_compute_prog.addPass(passes.output);
  }


  //link_pass_to_uniform sets the pass' sampler2D uniform to the output of another passes
  //it is necessary to constantly update this every frame due to double buffering
  //the computePass class handles this after you've linked the passes
  function set_pass_uniforms(passes){
    passes.velocity.link_pass_to_uniform("positions",  passes.position);
    passes.velocity.link_pass_to_uniform("excretions", passes.excrete);
    passes.position.link_pass_to_uniform("velocities", passes.velocity);
    passes.excrete.link_pass_to_uniform("positions",   passes.position);
    passes.excrete_a.link_pass_to_uniform("positions",   passes.position);
    passes.excrete_a.set_uniform("do_alpha", true);
    passes.render.link_pass_to_uniform("excretions",   passes.excrete_a);

    var colour_texture = new TextureLoader().load( 'assets/colour_gradient.jpg' );
    passes.render.set_uniform("colour_map",   colour_texture);
  }


  //any uniforms you want to change over time can be changed in the computePasses'
  //update function. The update function is set like below.
  function set_pass_update_functions(passes){
    let time = 0;

    passes.velocity.set_update_function(function(){
      passes.velocity.set_uniform("time",       time);
      passes.velocity.set_uniform("sniff_rotation",  3.1415926*.8 + (Math.sin(time/4)*3.14159/10.0));
      passes.velocity.set_uniform("sniff_odds",  ((Math.sin(time/3) + 1)/2.0)*0.2+0.1);
      time+=0.01;
    });
  }


  function start_draw_loop(gpu_compute_prog){

    //gpu_compute_prog curried into draw_loop
    function draw_loop() {
      gpu_compute_prog.render();
    	requestAnimationFrame( draw_loop );
    }

    draw_loop();
  }

}())
