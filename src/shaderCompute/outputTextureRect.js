import {
  OrthographicCamera,
  MeshBasicMaterial,
  PlaneGeometry,
  Mesh,
  Scene
} from 'three'


export default class OutputTextureRect{

  constructor(i_texture, i_size, i_camera){

  	this.updateFunction = function(){};
  	this.autoClear = true;

  	this.camera = new OrthographicCamera(-i_size.x/2, i_size.x/2, i_size.y/2, -i_size.y/2, -100, 100);
    this.camera.position.z = 10;

    this.material = new MeshBasicMaterial({map:i_texture});
  	let planeGeom = new PlaneGeometry( i_size.x, i_size.y );
  	this.mesh = new Mesh(planeGeom, this.material);
  	this.scene = new Scene();
  	this.scene.add(this.mesh);

  }


  set_update_function(i_updateFunction){
  	this.updateFunction = i_updateFunction;
  }


  update(){
  	this.updateFunction();
  }


  render(i_renderer){

  	let rendAutoSetting = i_renderer.autoClear;
  	i_renderer.autoClear = this.autoClear;
  	i_renderer.render(this.scene, this.camera);
  	i_renderer.autoClear = rendAutoSetting;

  }

}

export function create_output_pass(i_pass){

	var output_pass = new OutputTextureRect(i_pass.getOutputTexture(), {x:i_pass.size.x, y:i_pass.size.y});

	output_pass.set_update_function(function(){
		output_pass.material.map = i_pass.getOutputTexture();
	});

	return output_pass;

}
