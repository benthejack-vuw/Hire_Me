
//these settings run ok on a $250 Acer netbook
//a decent indication it'll run on almost anything
export const low = {
    render_texture_size: {x:1024, y:576},

    //the particle position and velocity textures will be a square of this size.
    //there will be a total of particle_count_sq^2 particles
    particle_count_sq   : 40,

    //Particles
    particle_size       : 25,
    particle_speed      : 0.001,
    sniff_size          : 25.0/1024.0,
    sniff_odds_min      : 0.1,
    sniff_odds_max      : 0.2,
    sniff_samples_sq    : 3,

    //Rendering
    fade_amount : 0.98,
    lower_mask_bound : 0.8,
    upper_mask_bound : 1.0,
}


export const medium = {

    render_texture_size : {x:1920, y:1080},

    //the particle position and velocity textures will be a square of this size.
    //there will be a total of particle_count_sq^2 particles
    particle_count_sq   : 60,


    particle_size       : 22,
    particle_speed      : 0.001,
    sniff_size          : 25.0/1920.0,
    sniff_odds_min      : 0.1,
    sniff_odds_max      : 0.4,
    sniff_samples_sq    : 5,

    //Rendering
    fade_amount : 0.98,
    lower_mask_bound : 0.5,
    upper_mask_bound : 1.0,
}

export const high = {
    render_texture_size : {x:1920, y:1080},

    //the particle position and velocity textures will be a square of this size.
    //there will be a total of particle_count_sq^2 particles
    particle_count_sq   : 100,

    particle_size       : 17,
    particle_speed      : 0.001,
    sniff_size          : 17.0/1920.0,
    sniff_odds_min      : 0.1,
    sniff_odds_max      : 0.4,
    sniff_samples_sq    : 5,

    //Rendering
    fade_amount : 0.985,
    lower_mask_bound : 0.8,
    upper_mask_bound : 1.0,
}

export const four_k = {
    render_texture_size : {x:1920*2, y:1080*2},

    //the particle position and velocity textures will be a square of this size.
    //there will be a total of particle_count_sq^2 particles
    particle_count_sq   : 110,

    particle_size       : 30,
    particle_speed      : 0.001,
    sniff_size          : 30.0/1920.0,
    sniff_odds_min      : 0.1,
    sniff_odds_max      : 0.3,
    sniff_samples_sq    : 5,

    //Rendering
    fade_amount : 0.985,
    lower_mask_bound : 0.7,
    upper_mask_bound : 1.0,
}

export const ultra = {
    render_texture_size : {x:1920*4, y:1080*4},

    //the particle position and velocity textures will be a square of this size.
    //there will be a total of particle_count_sq^2 particles
    particle_count_sq   : 200,

    particle_size       : 30,
    particle_speed      : 0.001,
    sniff_size          : 30.0/1920.0,
    sniff_odds_min      : 0.1,
    sniff_odds_max      : 0.3,
    sniff_samples_sq    : 3,

    //Rendering
    fade_amount : 0.98,
    lower_mask_bound : 0.7,
    upper_mask_bound : 1.0,
}
