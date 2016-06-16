var config = {
    width: window.innerWidth,
    height: window.innerHeight,
    aspectRatio: window.innerWidth/window.innerHeight,
    fov: 45,
    nearClip: 100,
    farClip: 1000002,
    renderQuality: 100,
    pointsAmount: 10
};
// Physijs.scripts.ammo = 'ammo.js';

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

var renderer = scene = bg = camera = null;
var frames = document.getElementsByClassName('fps')[0];
var cameraPos = document.getElementsByClassName('cameraZ')[0];

configureGl();

controls = new THREE.OrbitControls(camera, renderer.domElement);

var points = [], star, sphere;
sphere = getSphere();
sphere.position.set(0, 0, 0);
bg.add(sphere);

for (var i = 0; i < config.pointsAmount; i++) {
    var point = getMesh(i);

    point.castShadow = true;
    point.receiveShadow = false;
    point.mass = 1;

    point.acc = new THREE.Vector3(0, 0, 0);
    var v3pos = new THREE.Vector3(validPairs[i].pos.x, validPairs[i].pos.y, validPairs[i].pos.z)/*.multiplyScalar(1.5)*/;
    var v3vel = new THREE.Vector3(validPairs[i].vel.x, validPairs[i].vel.y, validPairs[i].vel.z)/*.multiplyScalar(3)*/;

    // if (i > 4) {
    //     v3pos.multiplyScalar(-1 * (i / 10));
    //     v3vel.multiplyScalar(-1);
    // }

    point.position.x = v3pos.x;
    point.position.y = v3pos.y;
    point.position.z = v3pos.z;

    point.vel = new THREE.Vector3(
        v3vel.x,
        v3vel.y,
        v3vel.z
    );

    point.startVel = point.vel.clone();
    point.startPos = point.position.clone();

    scene.add(point);

    points.push(point);
}
var globalLight = new THREE.AmbientLight(0x404040, 2);
scene.add(globalLight);

var sunLight = new THREE.PointLight(0xffd305, 3, 3500, 2);
sunLight.castShadow = true;

star = getStar();
star.mass = 35000;
star.position.set(0, 0, 0);

starGlow = getStarGlow();
starGlow.position = star.position;
starGlow.scale.multiplyScalar(2);
star.add(sunLight);
scene.add(star);
scene.add(starGlow);

var lastFrame = new Date(), currentFrame, fps, frameCounter = 0;
drawFrame();
function drawFrame() {
    //scene.simulate();
    requestAnimationFrame(drawFrame);

    starGlow.lookAt(camera.position);
    star.rotation.y = frameCounter*0.005;
    star.rotation.x = frameCounter*0.001;
    star.rotation.x = frameCounter*0.001;

    for (var i = 0; i < config.pointsAmount; i++) {
        var point = points[i];

        var distance = point.position.distanceTo(star.position);

        if (distance < 100) debugger;

        point.acc.x = star.mass * (0.0 - point.position.x) / Math.pow(distance, 3) * (point.mass * 0.3);
        point.acc.y = star.mass * (0.0 - point.position.y) / Math.pow(distance, 3) * (point.mass * 0.3);
        point.acc.z = star.mass * (0.0 - point.position.z) / Math.pow(distance, 3) * (point.mass * 0.3);

        point.vel.x += point.acc.x;
        point.vel.y += point.acc.y;
        point.vel.z += point.acc.z;

        // var distance = Math.sqrt(Math.pow(point.position.x, 2) + Math.pow(point.position.y, 2));
        // var attraction = point.mass * star.mass / Math.pow(distance, 2);

        // var halfmass = star.mass / 2;
        // var fx = (point.position.x - star.position.x) / halfmass;
        // var fy = (point.position.y - star.position.y) / halfmass;
        // var fz = (point.position.z - star.position.z) / halfmass;
        //
        // var hyp = point.position.distanceTo(star.position);
        // var forceApplied = star.mass * point.mass / (hyp * hyp) * 0.3;
        // var force = new THREE.Vector3(fx*forceApplied, fy*forceApplied, fz*forceApplied);
        //
        // point.acc.x = force.x;
        // point.acc.y = force.y;
        // point.acc.z = force.z;

        point.position.x += point.vel.x;
        point.position.y += point.vel.y;
        point.position.z += point.vel.z;

    }

    renderer.clear();
    renderer.render( bg, camera );
    renderer.clearDepth();
    renderer.render( scene, camera );

    frameCounter++;
    currentFrame = new Date();
    fps = Math.floor(1000 / (currentFrame - lastFrame));
    lastFrame = currentFrame;

    if (frameCounter % 60 == 0) {
        frames.innerText = fps;
        // points[42].position = new THREE.Vector3(100, 100, 100);
        // points[42].vel = new THREE.Vector3(5, 5, 5);
        // points[42].acc = new THREE.Vector3(0.05, 0.05, 0.05).multiplyScalar(-1);
    }

    cameraPos.innerText = camera.position.distanceTo(star.position);
}

function configureGl() {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    bg = new THREE.Scene({ reportsize: 1, fixedTimeStep: 1 / 30 });
    scene = new THREE.Scene({ reportsize: 300, fixedTimeStep: 1 / 60 });
    camera = new THREE.PerspectiveCamera(config.fov, config.aspectRatio, config.nearClip, config.farClip);
    // camera = new THREE.OrthographicCamera(config.width / - 2,
    //                                       config.width / 2,
    //                                       config.height / 2,
    //                                       config.height / - 2,
    //                                       config.nearClip, config.farClip);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.autoClear = false;
    renderer.setSize(config.width * (config.renderQuality / 100),
        config.height * (config.renderQuality / 100),
        false);

    document.body.appendChild(renderer.domElement);

    camera.position.z = 3000;
}

function getMesh(i) {
    var randomNum = Math.random() * (56 - 32) + 32;
    var geometry = new THREE.SphereGeometry(randomNum * 1.1, 16, 16);

    /* Texture load and new material creation */
    // var spacetex = THREE.ImageUtils.loadTexture("https://s3-us-west-2.amazonaws.com/s.cdpn.io/96252/space.jpg");
    // var spacesphereGeo = new THREE.SphereGeometry(20,20,20);
    // var spacesphereMat = new THREE.MeshPhongMaterial();
    // spacesphereMat.map = spacetex;

    var material = new THREE.MeshPhongMaterial({
        color: 0x3385ff,
        specular: 15
    });

    return new THREE.Mesh(geometry, material);
}

function getStar() {
    var geometry = new THREE.SphereGeometry(128, 64, 64);

    var uniforms = {
        preColor: {
            type: "c",
            value: new THREE.Color(0xffd305)
        }
    };

    var material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById('sunVertexShader').textContent,
        fragmentShader: document.getElementById('sunFragmentShader').textContent
    });

    return new THREE.Mesh(geometry, material);
}

function getStarGlow() {
    var glowMaterial = new THREE.ShaderMaterial(
        {
            uniforms:
            {
                "c": {type: "f", value: 0.21},
                "p": {type: "f", value: 6.0},
                glowColor: { type: "c", value: new THREE.Color(0xffd305) },
                viewVector: { type: "v3", value: camera.position }
            },
            vertexShader:   document.getElementById('glowVertexShader').textContent,
            fragmentShader: document.getElementById('glowFragmentShader').textContent,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

    return new THREE.Mesh(star.geometry.clone(), glowMaterial.clone());
}

function getSphere() {
    var geometry = new THREE.SphereGeometry(20000, 200, 200);

    var material = new THREE.MeshBasicMaterial({
        color: 0x00004d,
        side: THREE.BackSide
    });

    return new THREE.Mesh(geometry, material);
}

function toScreenPosition(obj, camera) {
    var vector = new THREE.Vector3();

    var widthHalf = 0.5*renderer.context.canvas.width;
    var heightHalf = 0.5*renderer.context.canvas.height;

    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);

    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;

    return {
        x: vector.x,
        y: vector.y
    };
}

function showDynamicData(i) {
    var number = i;
    console.info('acceleration');
    console.log(points[number].acc.x);
    console.log(points[number].acc.y);
    console.log(points[number].acc.z);

    console.info('velocity');
    console.log(points[number].vel.x);
    console.log(points[number].vel.y);
    console.log(points[number].vel.z);

    console.info('position');
    console.log(points[number].position.x);
    console.log(points[number].position.y);
    console.log(points[number].position.z);
}