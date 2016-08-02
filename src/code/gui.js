gui = new dat.GUI();
parameters =
{ c: 0.15, p: 2.0, bs: true, fs: false, nb: false, ab: true, mv: true, color: "#ffd305", camZ: 3000 };

var root = gui.addFolder('Glow Shader Attributes');

var innerGui = root.add( parameters, 'c' ).min(0.0).max(1.0).step(0.01).name("c").listen();

innerGui.onChange( function(value) {
    SolarSystem.getSun().starGlow.material.uniforms[ "c" ].value = parameters.c;
});

var outerGui = root.add( parameters, 'p' ).min(0.0).max(6.0).step(0.01).name("p").listen();
outerGui.onChange( function(value) {
    SolarSystem.getSun().starGlow.material.uniforms[ "p" ].value = parameters.p;
});

var glowColor = root.addColor( parameters, 'color' ).name('Glow Color').listen();
glowColor.onChange( function(value) {
    SolarSystem.getSun().starGlow.material.uniforms.glowColor.value.setHex( value.replace("#", "0x"));
});
root.open();

var folder1 = gui.addFolder('Render side');
var fsGUI = folder1.add( parameters, 'fs' ).name("THREE.FrontSide").listen();
fsGUI.onChange( function(value) {
    if (value)
    {
        bsGUI.setValue(false);
        SolarSystem.getSun().starGlow.material.side = THREE.FrontSide;
    }
});
var bsGUI = folder1.add( parameters, 'bs' ).name("THREE.BackSide").listen();
bsGUI.onChange( function(value) {
    if (value)
    {
        fsGUI.setValue(false);
        SolarSystem.getSun().starGlow.material.side = THREE.BackSide;
    }
});
folder1.open();

var folder2 = gui.addFolder('Blending style');
var nbGUI = folder2.add( parameters, 'nb' ).name("THREE.NormalBlending").listen();
nbGUI.onChange( function(value) {
    if (value)
    {
        abGUI.setValue(false);
        SolarSystem.getSun().starGlow.material.blending = THREE.NormalBlending;
    }
});
var abGUI = folder2.add( parameters, 'ab' ).name("THREE.AdditiveBlending").listen();
abGUI.onChange( function(value) {
    if (value)
    {
        nbGUI.setValue(false);
        SolarSystem.getSun().starGlow.material.blending = THREE.AdditiveBlending;
    }
});
folder2.open();

var folder3 = gui.addFolder('Misc');
var mvGUI = folder3.add( parameters, 'mv' ).name("Toggle Visibility").listen();

var camReset = function() {
    this.resetCam = camResetHandler;
};
var btnReset = new camReset();
folder3.add(btnReset,'resetCam');

mvGUI.onChange( function(value) {
    SolarSystem.getSun().mesh.visible = value;
});

function camResetHandler() {
    var camera = SolarSystem.getCamera();

    camera.position.set(0, 0, 8000);
    camera.lookAt(SolarSystem.getSun().mesh.position);
}

folder3.open();