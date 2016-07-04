var SolarSystem = {},
    config =
    {
        width: window.innerWidth,
        height: window.innerHeight,
        aspectRatio: window.innerWidth/window.innerHeight,
        fov: 45,
        nearClip: 100,
        farClip: 1000000,
        renderQuality: 100,
        planetsAmount: 10
    };

/* TODO: implement valid position/velocity generator */
var validPairs = [{
    "vel" : {"x" : 2.7125417986013174, "y" : -2.6572494209073865, "z" : -0.8195179254582308},
    "pos" : {"x" : 912.5999423338039, "y" : 755.5656460045411, "z" : -37.65876605958258}
}, {
    "vel" : {"x" : 2.059217780973765, "y" : -2.0482506158704794, "z" : 0.36779303898046745},
    "pos" : {"x" : 988.6788367763866, "y" : 981.9931297993488, "z" : 3.6747193027849363}
}, {
    "vel" : {"x" : 2.0341470462264386, "y" : -1.9141539267271603, "z" : -0.4694012565212047},
    "pos" : {"x" : 773.8166298392939, "y" : 711.9612793877226, "z" : -72.66610736839868}
}, {
    "vel" : {"x" : -2.7608423813967704, "y" : 3.0930361400999384, "z" : 0.9545451196799953},
    "pos" : {"x" : 661.953007891752, "y" : 574.0549086959136, "z" : -12.482350549837392}
}, {
    "vel" : {"x" : 2.394527755208163, "y" : -2.7431631613463354, "z" : -0.716587864976954},
    "pos" : {"x" : 923.5741156065409, "y" : 682.0700979072618, "z" : -82.06618754773567}
}, {
    "vel" : {"x" : -2.7125417986013174, "y" : 2.6572494209073865, "z" : 0.8195179254582308},
    "pos" : {"x" : -912.5999423338039, "y" : -755.5656460045411, "z" : 37.65876605958258}
}, {
    "vel" : {"x" : -2.059217780973765, "y" : 2.0482506158704794, "z" : -0.36779303898046745},
    "pos" : {"x" : -988.6788367763866, "y" : -981.9931297993488, "z" : -3.6747193027849363}
}, {
    "vel" : {"x" : -2.0341470462264386, "y" : 1.9141539267271603, "z" : 0.4694012565212047},
    "pos" : {"x" : -773.8166298392939, "y" : -711.9612793877226, "z" : 72.66610736839868}
}, {
    "vel" : {"x" : 2.7608423813967704, "y" : -3.0930361400999384, "z" : -0.9545451196799953},
    "pos" : {"x" : -661.953007891752, "y" : -574.0549086959136, "z" : 12.482350549837392}
}, {
    "vel" : {"x" : -2.394527755208163, "y" : 2.7431631613463354, "z" : 0.716587864976954},
    "pos" : {"x" : -923.5741156065409, "y" : -682.0700979072618, "z" : 82.06618754773567}
}];

(function(SolarSystem, config) {
    var me = SolarSystem || {};
    me.config = config || {};

    me.output = {};

    /* TODO: add array with objects that mush be add()'ed to scenes */
    var Renderer, Scene, Camera, SceneBackground, GlobalLight, Controls;

    var levelBox, Sun, planets = [],
        updatables = [];

    var currentFrame = 0,
        lastFrame = 0;

    me.stats =
    {
        framesCounter: 0,
        fps: 0,
        cameraRemoteness: 0
    };

    me.init = function() {
        me.initWebGl();

        me.initGeometry();

        me.initLights();

        Renderer.domElement.dispatchEvent( new Event( 'load' ) );
    };

    me.initWebGl = function() {
        Renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true }) ;
        Renderer.autoClear = false;
        Renderer.setSize(
            me.config.width * (me.config.renderQuality / 100),
            me.config.height * (me.config.renderQuality / 100)
        );

        SceneBackground = new THREE.Scene();

        Scene = new THREE.Scene();

        Camera = new THREE.PerspectiveCamera(
            me.config.fov,
            me.config.aspectRatio,
            me.config.nearClip,
            me.config.farClip
        );
        Camera.position.set(0.0, 0.0, 3000.0);

        document.body.appendChild(Renderer.domElement);

        me.output.frames = document.getElementsByClassName('fps')[0];
        
        me.output.cameraPos = document.getElementsByClassName('cameraRemoteness')[0];

        Renderer.domElement.addEventListener('load', me.initFinished);

        Renderer.domElement.addEventListener('ready', me.update);

        updatables.push(me.stats);

        Controls = new THREE.OrbitControls(Camera, Renderer.domElement);
    };
    
    me.initGeometry = function() {
        levelBox = new LevelBox();

        Sun = new Star( 0xffd305, 128, 35000, Camera );

        updatables.push(Sun);
        /* TODO: remove this */
        updatables.push(Sun.starGlow);

        var counter = 0, planetConfig, planet;
        while (counter < me.config.planetsAmount)
        {
            planetConfig =
            {
                size: Math.floor(Math.random() * (60 - 20) + 20),
                v3pos: new THREE.Vector3(
                    validPairs[counter].pos.x,
                    validPairs[counter].pos.y,
                    validPairs[counter].pos.z
                ),
                v3vel: new THREE.Vector3(
                    validPairs[counter].vel.x,
                    validPairs[counter].vel.y,
                    validPairs[counter].vel.z
                )
            };

            planet = new Planet( planetConfig, Sun );
            planets.push(planet);
            updatables.push(planet);

            counter += 1;
        }
    };

    me.initLights = function() {
        GlobalLight = new THREE.AmbientLight( 0x404040, 2 );
    };

    me.initFinished = function() {
        me.composeScene();

        me.prepareToRender();
    };

    me.composeScene = function() {
        SceneBackground.add(levelBox.mesh);

        Scene.add(Sun.mesh);
        Scene.add(Sun.starGlow);

        for (var i = 0; i < planets.length; i++) {
            Scene.add(planets[i].mesh);
        }

        Scene.add(GlobalLight);
    };

    me.prepareToRender = function() {
        lastFrame = new Date();

        me.output.frames.innerText = 'Initializing...';

        me.output.cameraPos.innerText = 'Initializing...';

        /* TODO: init controls here */

        Renderer.domElement.dispatchEvent( new Event( 'ready' ) );
    };

    me.update = function() {
        requestAnimationFrame(me.update);

        for (var i = 0, objectsToUpdate = updatables.length; i < objectsToUpdate; i++) {
            updatables[i].update();
        }

        Renderer.clear();
        Renderer.render(SceneBackground, Camera);
        Renderer.clearDepth();
        Renderer.render(Scene, Camera);
    };


    me.stats.update = function() {
        this.framesCounter++;

        currentFrame = new Date();

        this.fps = Math.floor(1000/ (currentFrame - lastFrame));

        lastFrame = currentFrame;

        if ( !(this.framesCounter % 60) )
            me.output.frames.innerText = this.fps;

        me.output.cameraPos.innerText = Camera.position.distanceTo(Sun.mesh.position);
    };

    /* TODO: Implement getters/setters for SolarSystem members */
    me.init();

})(SolarSystem, config);

function Star( color, size, mass, cameraObject, starConfig ) {
    var config = starConfig || {};

    var starGeometry = new THREE.SphereGeometry( size || 120, (size / 2) || 64, (size / 2) || 64 );

    var starMaterial = new THREE.ShaderMaterial({
        uniforms:
        {
            preColor:
            {
                type: "c",
                value: new THREE.Color( color || 0xffd305 )
            }
        },
        vertexShader: document.getElementById('sunVertexShader').textContent,
        fragmentShader: document.getElementById('sunFragmentShader').textContent
    });

    this.mesh = new THREE.Mesh( starGeometry, starMaterial );

    this.mass = mass || 30000;

    this.mesh.position = new THREE.Vector3( 0.0, 0.0, 0.0 );

    var starLightConfig =
    {
        color: color || 0xffd305,
        intensity: config.intensity || 3,
        distance: config.distance || 3500,
        attenuation: config.attenuation || 2
    };

    this.starLight = new THREE.PointLight(
        starLightConfig.color,
        starLightConfig.intensity,
        starLightConfig.distance,
        starLightConfig.attenuation
    );

    this.mesh.add(this.starLight);

    var starGlowConfig =
    {
        const: config.glowConst || 0.21,
        power: config.glowPower || 6.0,
        glowColor: color || 0xffd305
    };

    var starGlowMaterial = new THREE.ShaderMaterial(
    {
        uniforms:
        {
            c:
            {
                type: "f",
                value: starGlowConfig.const
            },
            p:
            {
                type: "f",
                value: starGlowConfig.power
            },
            glowColor:
            {
                type: "c",
                value: new THREE.Color(starGlowConfig.glowColor)
            },
            viewVector:
            {
                type: "v3",
                value: cameraObject.position
            }
        },
        vertexShader: document.getElementById('glowVertexShader').textContent,
        fragmentShader: document.getElementById('glowFragmentShader').textContent,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    });

    var starGlowGeometry = this.mesh.geometry.clone();

    this.starGlow = new THREE.Mesh( starGlowGeometry, starGlowMaterial );

    this.starGlow.scale.multiplyScalar(2.0);

    this.starGlow.position = this.mesh.position;

    // TODO: glow must be child of star object, fix rotation
    //this.mesh.add(this.starGlow);
    this.starGlow.update = function() {
        this.lookAt(cameraObject.position);
    };

    this.update = function() {
        var frameNumber = SolarSystem.stats.framesCounter;

        this.mesh.rotation.x = frameNumber * 0.005;
        this.mesh.rotation.y = frameNumber * 0.001;
        this.mesh.rotation.z = frameNumber * 0.001;

        //this.starGlow.lookAt(this.starGlow.worldToLocal(cameraObject.position.clone()));
    };

}

function Planet( config, starObject ) {
    var planetGeometry = new THREE.SphereGeometry( config.size || 20, config.size / 2 || 10, config.size / 2 || 10);

    var planetMaterial = new THREE.MeshPhongMaterial(
    {
        color: config.color || 0x3385ff,
        specular: 15
    });
    
    this.mesh = new THREE.Mesh( planetGeometry, planetMaterial );
    
    this.mass = 2.5;

    this.acceleration = new THREE.Vector3( 0.0, 0.0, 0.0 );

    this.velocity = config.v3vel.clone();

    this.mesh.position.x = config.v3pos.x;
    this.mesh.position.y = config.v3pos.y;
    this.mesh.position.z = config.v3pos.z;

    /* TODO: implement parent wrapper-class for star, planets etc */
    this.distanceTo = function(object3d) {
        if (object3d && object3d.mesh) return this.mesh.position.distanceTo(object3d.mesh.position);
    };

    this.update = function() {
        var distance = this.distanceTo(starObject);
        var distanceCubed = Math.pow(distance, 3);

        var dx = starObject.mesh.position.x - this.mesh.position.x;
        var dy = starObject.mesh.position.y - this.mesh.position.y;
        var dz = starObject.mesh.position.z - this.mesh.position.z;

        var divisor = distanceCubed * this.mass;

        this.acceleration.x = starObject.mass * dx / divisor;
        this.acceleration.y = starObject.mass * dy / divisor;
        this.acceleration.z = starObject.mass * dz / divisor;

        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;
        this.velocity.z += this.acceleration.z;

        this.mesh.position.x += this.velocity.x;
        this.mesh.position.y += this.velocity.y;
        this.mesh.position.z += this.velocity.z;
    };

}

function LevelBox( config ) {
    var geometry = new THREE.SphereGeometry( 50000, 50, 50 );

    var material = new THREE.MeshBasicMaterial(
    {
        color: 0x00004d,
        side: THREE.BackSide
    });

    this.mesh = new THREE.Mesh( geometry, material );
}