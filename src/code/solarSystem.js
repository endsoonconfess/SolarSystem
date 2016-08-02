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
        planetsAmount: 9
    };

var planetsConfig = [{
    "vel" : {"x" : 0.1125417986013174, "y" : -0.1195179254582308, "z" : 4.772494209073865},
    "pos" : {"x" : -460.5999423338039, "y" : 0.5656460045411, "z" : -0.65876605958258},
    "surfaceColor" : {"hex" : 0x7C5F3F},
    "atmosphereColor" : {"hex" : 0x7C5F3F},
    "atmosphereSize" : 1.05,
    "size" : 20,
    "name" : "mercury"
}, {
    "vel" : {"x" : 0.059217780973765, "y" : 0.36779303898046745, "z" : 3.5482506158704794},
    "pos" : {"x" : -1070.6788367763866, "y" : 0.9931297993488, "z" : 0.6747193027849363},
    "surfaceColor" : {"hex" : 0x773075},
    "atmosphereColor" : {"hex" : 0x773075},
    "atmosphereSize" : 1.05,
    "size" : 75,
    "name" : "venus"
}, {
    "vel" : {"x" : 0.0341470462264386, "y" : -0.4694012565212047, "z" : 2.9141539267271603},
    "pos" : {"x" : -1470.8166298392939, "y" : 0.9612793877226, "z" : -0.66610736839868},
    "surfaceColor" : {"hex" : 0xffffff},
    "atmosphereColor" : {"hex" : 0x44BFD4},
    "atmosphereSize" : 1.1,
    "size" : 90,
    "name" : "earth"
}, {
    "vel" : {"x" : -0.0608423813967704, "y" : 0.1545451196799953, "z" : 2.4930361400999384},
    "pos" : {"x" : -2075.953007891752, "y" : 0.0549086959136, "z" : -0.482350549837392},
    "surfaceColor" : {"hex" : 0x653300},
    "atmosphereColor" : {"hex" : 0x653300},
    "atmosphereSize" : 1.05,
    "size" : 60,
    "name" : "mars"
}, {
    "vel" : {"x" : 0.024527755208163, "y" : -0.006587864976954, "z" : 1.7431631613463354},
    "pos" : {"x" : -3420.5741156065409, "y" : 0.0700979072618, "z" : -0.06618754773567},
    "surfaceColor" : {"hex" : 0xDAB172},
    "atmosphereColor" : {"hex" : 0xDAB172},
    "atmosphereSize" : 1.05,
    "size" : 210,
    "name" : "jupiter"
}, {
    "vel" : {"x" : 0.0025417986013174, "y" : 0.0195179254582308, "z" : 1.7572494209073865},
    "pos" : {"x" : -4830.5999423338039, "y" : -0.5656460045411, "z" : 0.65876605958258},
    "surfaceColor" : {"hex" : 0xFDB747},
    "atmosphereColor" : {"hex" : 0xFDB747},
    "atmosphereSize" : 1.05,
    "size" : 185,
    "name" : "saturn"
}, {
    "vel" : {"x" : 0.019217780973765, "y" : -0.15779303898046745, "z" : 1.4882506158704794},
    "pos" : {"x" : -6325.6788367763866, "y" : -0.9931297993488, "z" : -0.6747193027849363},
    "surfaceColor" : {"hex" : 0xBCDDE4},
    "atmosphereColor" : {"hex" : 0xBCDDE4},
    "atmosphereSize" : 1.05,
    "size" : 165,
    "name" : "uranus"
}, {
    "vel" : {"x" : 0.0141470462264386, "y" : 0.1394012565212047, "z" : 1.1941539267271603},
    "pos" : {"x" : -8292.8166298392939, "y" : -0.9612793877226, "z" : 0.66610736839868},
    "surfaceColor" : {"hex" : 0x8792D2},
    "atmosphereColor" : {"hex" : 0x8792D2},
    "atmosphereSize" : 1.05,
    "size" : 195,
    "name" : "neptune"
}, {
    "vel" : {"x" : 0.0018423813967704, "y" : -0.0545451196799953, "z" : -1.0670361400999384},
    "pos" : {"x" : -9352.953007891752, "y" : -0.0549086959136, "z" : 0.482350549837392},
    "surfaceColor" : {"hex" : 0xC7B4A6},
    "atmosphereColor" : {"hex" : 0xC7B4A6},
    "atmosphereSize" : 1.05,
    "size" : 15,
    "name" : "pluto"
}];

(function(SolarSystem, config) {
    var me = SolarSystem || {};
    me.config = config || {};

    me.output = {};

    me.stats =
    {
        framesCounter: 0,
        fps: 0,
        cameraRemoteness: 0
    };

    /* TODO: add array with objects that mush be add()'ed to scenes */
    var Renderer, Scene, Camera, SceneBackground, GlobalLight, Controls;

    var levelBox, Sun, planets = [],
        updatables = [];

    var currentFrame = 0,
        lastFrame = 0;

    me.getSun = function() {
        return Sun;
    };

    me.getCamera = function() {
        return Camera;
    };

    function init() {
        initWebGl();

        loadTextures();
    }

    function onTexturesLoaded() {
        initGeometry();

        initLights();

        Renderer.domElement.dispatchEvent( new Event( 'load' ) );
    }

    function initWebGl() {
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
        Camera.position.set(5750.0, 9000.0, 9050.0);

        document.body.appendChild(Renderer.domElement);

        me.output.frames = document.getElementsByClassName('fps')[0];
        
        me.output.cameraPos = document.getElementsByClassName('cameraRemoteness')[0];

        Renderer.domElement.addEventListener('load', initFinished);

        Renderer.domElement.addEventListener('ready', update);

        Renderer.domElement.addEventListener('texturesloaded', onTexturesLoaded);

        updatables.push(me.stats);

        Controls = new THREE.OrbitControls(Camera, Renderer.domElement);
    }

    function loadTextures() {
        var textureLoader = new THREE.TextureLoader();
        var countOfLoaded = 0;

        for (var i = 0; i < me.config.planetsAmount; i++) {

            planetsConfig[i].texture = textureLoader.load(

                'resources/textures/' + planetsConfig[i].name + '.jpg',

                function(texture) {
                    countOfLoaded += 1;

                    if ( countOfLoaded == me.config.planetsAmount )
                        Renderer.domElement.dispatchEvent( new Event( 'texturesloaded' ) );
                }
            );
        }
    }
    
    function initGeometry() {
        levelBox = new LevelBox();

        Sun = new Star( 0xffd305, 128, 35000, Camera );

        updatables.push(Sun);

        var counter = 0, planetConfig, planet;
        while (counter < me.config.planetsAmount)
        {
            planetConfig =
            {
                v3pos: new THREE.Vector3(
                    planetsConfig[counter].pos.x,
                    planetsConfig[counter].pos.y,
                    planetsConfig[counter].pos.z
                ),
                v3vel: new THREE.Vector3(
                    planetsConfig[counter].vel.x,
                    planetsConfig[counter].vel.y,
                    planetsConfig[counter].vel.z
                ),
                texture: planetsConfig[counter].texture,
                surfaceColor: planetsConfig[counter].surfaceColor,
                atmosphereColor: planetsConfig[counter].atmosphereColor,
                atmosphereSize: planetsConfig[counter].atmosphereSize,
                size: planetsConfig[counter].size,
                name: planetsConfig[counter].name
            };

            planet = new Planet( planetConfig, Sun, Camera );
            planets.push(planet);
            updatables.push(planet);

            counter += 1;
        }
    }

    function initLights() {
        GlobalLight = new THREE.AmbientLight( 0x404040, 2 );
    }

    function initFinished() {
        composeScene();

        prepareToRender();
    }

    function composeScene() {
        SceneBackground.add(levelBox.mesh);

        Scene.add(Sun.starGlow);
        Scene.add(Sun.mesh);

        for (var i = 0; i < planets.length; i++) {
            Scene.add(planets[i].planetGlow);
            Scene.add(planets[i].mesh);
        }

        Scene.add(GlobalLight);
    }

    function prepareToRender() {
        lastFrame = new Date();

        me.output.frames.innerText = 'Initializing...';

        me.output.cameraPos.innerText = 'Initializing...';

        Renderer.domElement.dispatchEvent( new Event( 'ready' ) );
    }

    function update() {
        requestAnimationFrame(update);

        for (var i = 0, objectsToUpdate = updatables.length; i < objectsToUpdate; i++) {
            updatables[i].update();
        }

        Renderer.clear();
        Renderer.render(SceneBackground, Camera);
        Renderer.clearDepth();
        Renderer.render(Scene, Camera);
    }


    me.stats.update = function() {
        this.framesCounter++;

        currentFrame = new Date();

        this.fps = Math.floor(1000/ (currentFrame - lastFrame));

        lastFrame = currentFrame;

        if ( !(this.framesCounter % 60) )
            me.output.frames.innerText = this.fps;

        me.output.cameraPos.innerText = Camera.position.distanceTo(Sun.mesh.position);
    };

    init();

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
        color: 0xffffff,
        intensity: config.intensity || 1.8,
        distance: config.distance || 20000,
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
                value: new THREE.Vector3( 0.0, 0.0, 14000.0 )
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

    this.update = function() {
        var frameNumber = SolarSystem.stats.framesCounter;

        this.mesh.rotation.x = frameNumber * 0.005;
        this.mesh.rotation.y = frameNumber * 0.001;
        this.mesh.rotation.z = frameNumber * 0.001;

        this.starGlow.lookAt(cameraObject.position);
        //this.starGlow.lookAt(this.starGlow.worldToLocal(cameraObject.position.clone()));
    };

}

function Planet( config, starObject, cameraObject ) {
    var planetGeometry = new THREE.SphereGeometry( config.size || 20, config.size || 20, config.size || 20);

    var planetMaterial = new THREE.MeshPhongMaterial(
    {
        color: config.surfaceColor.hex || 0x3385ff,
        specular: 15,
        shininess: 5,
        map: config.texture
    });

    this.mesh = new THREE.Mesh( planetGeometry, planetMaterial );

    this.mass = 2.5;

    this.acceleration = new THREE.Vector3( 0.0, 0.0, 0.0 );

    this.velocity = config.v3vel.clone();

    this.mesh.position.x = config.v3pos.x;
    this.mesh.position.y = config.v3pos.y;
    this.mesh.position.z = config.v3pos.z;

    var planetGlowConfig =
    {
        const: 0.1,
        power: 1.0,
        glowColor: config.atmosphereColor.hex
    };

    var planetGlowMaterial = new THREE.ShaderMaterial(
        {
            uniforms:
            {
                c:
                {
                    type: "f",
                    value: planetGlowConfig.const
                },
                p:
                {
                    type: "f",
                    value: planetGlowConfig.power
                },
                glowColor:
                {
                    type: "c",
                    value: new THREE.Color(planetGlowConfig.glowColor)
                },
                viewVector:
                {
                    type: "v3",
                    value: new THREE.Vector3( 0.0, 0.0, 14000.0 )
                }
            },
            vertexShader: document.getElementById('glowVertexShader').textContent,
            fragmentShader: document.getElementById('glowFragmentShader').textContent,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

    var planetGlowGeometry = this.mesh.geometry.clone();

    this.planetGlow = new THREE.Mesh( planetGlowGeometry, planetGlowMaterial );

    this.planetGlow.scale.multiplyScalar(config.atmosphereSize);

    this.planetGlow.position = this.mesh.position;

    /* TODO: implement parent wrapper-class for star, planets etc */
    this.distanceTo = function(object3d) {
        if (object3d && object3d.mesh) return this.mesh.position.distanceTo(object3d.mesh.position);
    };

    this.update = function() {
        var frameNumber = SolarSystem.stats.framesCounter;

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

        this.mesh.rotation.y = frameNumber * 0.0025;

        this.planetGlow.position.x = this.mesh.position.x;
        this.planetGlow.position.y = this.mesh.position.y;
        this.planetGlow.position.z = this.mesh.position.z;

        this.planetGlow.lookAt(cameraObject.position);
    };

}

function LevelBox( config ) {
    var geometry = new THREE.SphereGeometry( 50000, 50, 50 );

    var material = new THREE.MeshPhongMaterial(
    {
        color: 0x000010,
        side: THREE.DoubleSide,
        map: new THREE.TextureLoader().load('resources/textures/space.jpg')
    });

    this.mesh = new THREE.Mesh( geometry, material );
}