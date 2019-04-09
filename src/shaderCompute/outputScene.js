

export default class OutputScene{

  constructor(i_scene, i_camera){
  	this.scene = i_scene;
  	this.camera = i_camera;
  	this.updateFunction = function(){};
  	this.autoClear = true;
  }

  setUpdateFunction(i_updateFunction){
  	this.updateFunction = i_updateFunction;
  }

  update(){
  	this.updateFunction();
  }

  render(i_renderer){

    i_renderer.setRenderTarget(null);
    if(this.autoClear){
      i_renderer.clear();
    }
    i_renderer.render(this.scene, this.camera);

  }

}
