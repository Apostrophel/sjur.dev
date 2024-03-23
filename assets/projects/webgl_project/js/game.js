/**
 * Created by jonsor on 12.10.2015.
 */

'use strict';
var _temp_vector3_1 = new THREE.Vector3;
Physijs.scripts.worker = 'js/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

var scene, camera, renderer;
var cube;
var controls;
var prevTime;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var moveUp = false;
var moveDown = false;
var cam;
var mirrorCubeCamera;
var maxHeight;
var heightMapGeometry;
var terrainData;

var particleSystem;

var heightMapMaterialCustom;

var vel = new THREE.Vector3();

var shadingImage;

function init() {
    prevTime = performance.now();
    scene = new Physijs.Scene;
    scene.setGravity(new THREE.Vector3( 0, -30, 0 ));
    scene.addEventListener(
        'update',
        function() {
            update();
            scene.simulate( undefined, 1 );
        }
    );

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 100000);
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight); //setSize(window.innerWidth/2, window.innerHeight/2, false) for lavere oppl�sning

//Shadows
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    document.body.appendChild(renderer.domElement);

//Geometry
    //CAMERA BOX
    //camera.position.y = 60;
    var geometryCam = new THREE.BoxGeometry(2, 4, 2);
    var materialCam = new THREE.MeshBasicMaterial({color: 0x00ff00});
    var materialCamPhys = Physijs.createMaterial(materialCam, 0.4, 0.6);

    cam = new Physijs.BoxMesh(geometryCam, materialCamPhys);
    cam.position.y = 550; //GET MAX TERRAIN HEIGHT...
    cam._dirtyRotation = true;
    cam.weight = 100;
    scene.add(cam);

    //MIRROR BOX
    mirrorCubeCamera = new THREE.CubeCamera( 0.1, 32000, 1024 );
    mirrorCubeCamera.position.set(0, 51, 0);
    scene.add(mirrorCubeCamera);
    var geometryCube = new THREE.BoxGeometry(50, 50, 50);
    var materialCube = new THREE.MeshBasicMaterial({ envMap: mirrorCubeCamera.renderTarget});
    var materialCubePhys = Physijs.createMaterial(materialCube);

    cube = new Physijs.BoxMesh(geometryCube, materialCubePhys);

    //cube = new THREE.Mesh(geometryCube, materialCube);
    cube.castShadow = true;
    cube.recieveShadow = true;
    cube.position.z = -15;
    cube.position.y = 200;
    //scene.add(cube);

    //LOTS OF AWESOME BOXES
    for(var ly = 0; ly <= 3; ly++){
        var geometryCube1 = new THREE.BoxGeometry(getRandMinMax(5,40), getRandMinMax(5,40), getRandMinMax(5,40));
        var randColour = '#'+Math.floor(Math.random()*16777215).toString(16);
        var transpar = getRandMinMax(0, 10);
        if(transpar>5){
            var materialCube1 = new THREE.MeshLambertMaterial({color: randColour});
        }else {
            var materialCube1 = new THREE.MeshLambertMaterial({color: randColour, opacity: 0.7, transparent: true});
        }

        //var materialCubePhys1 = Physijs.createMaterial(materialCube1);
        var cube3 = new Physijs.BoxMesh(geometryCube1, materialCube1);
        cube3.castShadow = true;
        cube3.recieveShadow = true;
        cube3.position.z = getRandMinMax(-500,500);
        cube3.position.y = getRandMinMax(1,1000);
        cube3.position.x = getRandMinMax(-500,500);
        scene.add(cube3);
    }

    //GROUND
    var groundMaterial = new THREE.MeshPhongMaterial({color: 0x6C6C6C});
    var groundMaterialPhysijs = Physijs.createMaterial(groundMaterial, 0.2, 0.3);
    var groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    var plane = new Physijs.PlaneMesh(groundGeometry, groundMaterialPhysijs, 0);
    //var plane = new THREE.Mesh(groundGeometry, groundMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);
w


    //HEIGHTMAP
    var  worldWidth = 512;
    var  worldDepth = 512;
    terrainData = generateHeight( worldWidth, worldDepth );

    var terrainTexture = new THREE.CanvasTexture( generateTexture( terrainData, worldWidth, worldDepth ) );
    terrainTexture.wrapS = THREE.ClampToEdgeWrapping;
    terrainTexture.wrapT = THREE.ClampToEdgeWrapping;

    heightMapGeometry = new THREE.PlaneGeometry(worldWidth*10,worldDepth*10, worldWidth-1, worldDepth-1);

    maxHeight = 0;
    for ( var i = 0; i < heightMapGeometry.vertices.length; i++ ) {
       heightMapGeometry.vertices[i].z = terrainData[i]*3; //Edit multiplum to get higher or lower mountains.
       if(heightMapGeometry.vertices[i].z > maxHeight){
           maxHeight = heightMapGeometry.vertices[i].z;
       }
    }

    var grassTexture = new THREE.ImageUtils.loadTexture('img/grass512.jpg');
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;

    var rockTexture = new THREE.ImageUtils.loadTexture('img/rock512.jpg');
    rockTexture.wrapS = rockTexture.wrapT = THREE.RepeatWrapping;

    var snowTexture = new THREE.ImageUtils.loadTexture('img/snow.jpg'); //(same as snow512)
    snowTexture.wrapS = snowTexture.wrapT = THREE.RepeatWrapping;

   heightMapMaterialCustom = new THREE.ShaderMaterial({
        uniforms: {
           // camPos: {type: "v4", value: [cam.position.x, cam.position.y, cam.position.z, 1]},
            fogColor: {type: "v3", value: new THREE.Vector3(0.5, 0.6, 0.7)},
            fogConst: {type: "f", value: 0.0009},
            textureScale: {type: "f", value: 70},

            sandLow: {type: "f", value: .0}, //Sand starting point
            sandHigh: {type: "f", value: maxHeight/2},  //sand spreading value / size

            rockLow: {type: "f", value: maxHeight/1.5}, //rock starting point
            rockHigh: {type: "f", value: maxHeight/2.5},//rock spreading value / size

            snowLow: {type: "f", value: maxHeight},
            snowHigh: {type: "f", value: maxHeight /1.3},

            texture_grass: { type: "t", value: grassTexture },
            texture_rock: { type: "t", value: rockTexture },
            texture_snow: { type: "t", value: snowTexture},

        },
        vertexShader: document.getElementById( 'groundVertexShader' ).textContent,
        fragmentShader: document.getElementById( 'groundFragmentShader' ).textContent
    });


   // cam.position.y = maxHeight+50; //GET TERRAIN HEIGHT at starting position ...
    //var heightMapMaterial = new THREE.MeshPhongMaterial( { color: 0x8470ff } ); //map: terrainTexture
    var heightMapMaterialPhys = Physijs.createMaterial(heightMapMaterialCustom, 0.2, 0.3); //HEIGHTMAPCUSTOM SWAP

    var terrainMesh;
    terrainMesh = new Physijs.HeightfieldMesh(heightMapGeometry, heightMapMaterialPhys, 0);
    terrainMesh.name = "terrain";
    terrainMesh.rotation.x = -Math.PI / 2;
    terrainMesh.castShadow = false;
    terrainMesh.receiveShadow = true;
    scene.add( terrainMesh );



//Lights
    scene.add(new THREE.AmbientLight(0x666666));

    var light = new THREE.SpotLight(0xffffff, 1);
    light.shadowDarkness = 0.6;
    light.castShadow = true;
    light.shadowMapWidth = 2048;
    light.shadowMapHeight = 2048;

    // light.shadowCameraVisible = true;
    light.shadowCameraNear = true;
    light.shadowCameraNear = 30;
    light.shadowCameraFar = 1000;
    var d = 5;
    light.shadowCameraLeft = -d;
    light.shadowCameraRight = d;
    light.shadowCameraTop = d;
    light.shadowCameraBottom = -d;

    light.position.set(200, 800, 300);
    scene.add(light);
    //scene.add(new THREE.SpotLightHelper(light, 0.2));

    //WATER PLANE
    var waterPlaneGeom = new THREE.PlaneGeometry(5120,5120);
    var waterMaterial = new THREE.MeshPhongMaterial({envMap: mirrorCubeCamera.renderTarget, opacity: 0.6, transparent: true});
    var underWaterMaterial = new THREE.MeshPhongMaterial({ color: 0x66FFFF, opacity: 0.5, transparent: true});
    var waterMesh = new THREE.Mesh(waterPlaneGeom, waterMaterial);
    var underWaterMesh = new THREE.Mesh(waterPlaneGeom, underWaterMaterial);
    waterMesh.rotation.x=-Math.PI /2;
    waterMesh.position.y=maxHeight/8;
    underWaterMesh.rotation.x=Math.PI /2;
    underWaterMesh.position.y=(maxHeight/8)-0.01;
    scene.add(waterMesh);
    scene.add(underWaterMesh);
    scene.fog = new THREE.FogExp2( 0xefd1b5, 0.0025 ); //WATER FOG and more (three.js objects)


    //SKYBOX
    var imagePrefix = "skyboxes/desert/desert_evening_";
    var directions  = ["right", "left", "top", "bottom", "front", "back"];
    var suffix = ".jpg";
    var skyGeometry = new THREE.CubeGeometry( 30000, 30000, 30000 );

    var materialArray = [];
    for (var i = 0; i < 6; i++)
        materialArray.push( new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + suffix),
            side: THREE.BackSide,
            fog: false
        }));

    var skyMaterial = new THREE.MeshFaceMaterial( materialArray);
    var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
    scene.add( skyBox );

    //camera.position.z = 15;
    keyboardMovement();

    // controls = new THREE.FirstPersonControls(camera, renderer.domElement);
    controls = new THREE.PointerLockControls( camera );
    scene.add(controls.getObject());
    controls.enabled = true;

    //controls = new THREE.OrbitControls( camera, renderer.domElement );

    var element = document.body;
    element.addEventListener( 'click', function ( event ) {
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        element.requestPointerLock();
    }, false);

    window.addEventListener('resize', onWindowResize, false);

    //SNOW PARTICLES TEST
    var particles = new THREE.Geometry;
    var particleTexture = THREE.ImageUtils.loadTexture('img/particles/snowflakePin.png');
    var particleMaterial = new THREE.ParticleBasicMaterial({ map: particleTexture, transparent: true, size: 5 });
    //randomize position of pushed particles:
    for (var p = 0; p < 10000; p++) {
        var particle = new THREE.Vector3(Math.random() * 5000 - 2500, Math.random() * 5000 - 2500, Math.random() * 5000 - 2500);
        particles.vertices.push(particle);
    }
    particleSystem = new THREE.ParticleSystem(particles, particleMaterial);
    scene.add(particleSystem);

    //BUBBLE PARTICLES
    var bubbles = new THREE.Geometry;
    var bubbleTexture = THREE.ImageUtils.loadTexture('img/particles/bubble1.png');
    var bubbleMaterial = new THREE.ParticleBasicMaterial({ map: bubbleTexture, transparent: true, size: 1});
    //randomize position of pushed particles:
    for (var b = 0; b < 100000; b++) {
        var bubble = new THREE.Vector3(Math.random() * 5000 - 2500, Math.random() * 90 - 25, Math.random() * 5000 - 2500);
        bubbles.vertices.push(bubble);
    }
    var bubbleSystem = new THREE.ParticleSystem(bubbles, bubbleMaterial);
    scene.add(bubbleSystem);

    render();
    scene.simulate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function update() {

    vel.x = vel.x * 0.9;
    vel.z = vel.z * 0.9;
    vel.y = vel.y * 0.9;

    var speed = 10;
    if ( moveForward ) vel.x -= speed;
    if ( moveBackward ) vel.x += speed;
    if ( moveLeft ) vel.z -= speed;
    if ( moveRight ) vel.z += speed;
    if ( moveUp ) vel.y += speed;
    if ( moveDown ) vel.y -= speed;
    cam.setAngularFactor({x: 0, y: 0, z: 0});
   // vel.y = cam.getLinearVelocity().y; //Comment out for flying
    var  velocity = {x: vel.x* Math.sin(controls.getObject().rotation.y) + vel.z* Math.sin(controls.getObject().rotation.y+Math.PI / 2),
        y: vel.y,
        z: vel.x * Math.cos(controls.getObject().rotation.y)+ vel.z* Math.cos(controls.getObject().rotation.y+Math.PI / 2)};

    cam.setLinearVelocity(velocity);

    controls.getObject().position.x = cam.position.x;
    controls.getObject().position.y = cam.position.y;
    controls.getObject().position.z = cam.position.z;

    cam.rotation.copy(controls.getObject().rotation);
    cam._dirtyRotation = true;
    mirrorCubeCamera.position.set(cam.position.x, cam.position.y, cam.position.z);
        //heightMapGeometry.getHeightAtPoint(cam.position)
        //terrainData.getHeightAtPoint(cam.position.x, cam.position.z)

    if(cam.position.y < maxHeight/8){
        heightMapMaterialCustom.uniforms.fogColor.value = new THREE.Vector3(0.0,1.0,1.0);
        heightMapMaterialCustom.uniforms.fogConst.value = 0.009;
    }else {
        heightMapMaterialCustom.uniforms.fogColor.value = new THREE.Vector3(0.5,0.6,0.7);
        heightMapMaterialCustom.uniforms.fogConst.value = 0.0009;
    }
}

function render() {

    var time = performance.now();
    var delta = ( time - prevTime ) / 1000;
    if(delta > 0.5) delta = 0.5;
    requestAnimationFrame(render);

    prevTime = time;

    particleSystem.rotation.y += delta/4;
    //cube.visible = false;
    mirrorCubeCamera.updateCubeMap( renderer, scene );
   // cube.visible = true;


    renderer.render(scene, camera);
}

function keyboardMovement(){
    var onKeyDown = function ( event ) {
        switch ( event.keyCode ) {
            case 38: // up
            case 87: // w
                moveForward = true;
                break;
            case 37: // left
            case 65: // a
                moveLeft = true; break;
            case 40: // down
            case 83: // s
                moveBackward = true;
                break;
            case 39: // right
            case 68: // d
                moveRight = true;
                break;
            case 32: // space
                moveUp = true;
                break;
            case 17: // space
                moveDown = true;
                break;
        }
    };
    var onKeyUp = function ( event ) {
        switch( event.keyCode ) {
            case 38: // up
            case 87: // w
                moveForward = false;
                break;
            case 37: // left
            case 65: // a
                moveLeft = false;
                break;
            case 40: // down
            case 83: // s
                moveBackward = false;
                break;
            case 39: // right
            case 68: // d
                moveRight = false;
                break;
            case 32: // space
                moveUp = false;
                break;
            case 17: // space
                moveDown = false;
                break;
        }
    };

    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);

}

function generateHeight( width, height ) {

    var size = width * height, data = new Uint8Array( size ),
        perlin = new ImprovedNoise(), quality = 1, z = Math.random() * 100;

    for ( var j = 0; j < 4; j ++ ) {

        for ( var i = 0; i < size; i ++ ) {

            var x = i % width, y = ~~ ( i / width );
            data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );

        }

        quality *= 5;

    }

    return data;

}

generateHeight.prototype.getHeightAtPoint = function(x, z) {
    var vertexIndex = 3*this.computeVertexIndex(x, z);

    var height = this.attributes.position.array[vertexIndex + 1];

    return height;
};

function generateTexture( data, width, height ) {

    var canvas, canvasScaled, context, image, imageData,
        level, diff, vector3, sun, shade;

    vector3 = new THREE.Vector3( 0, 0, 0 );

    sun = new THREE.Vector3( 1, 1, 1 );
    sun.normalize();

    canvas = document.createElement( 'canvas' );
    canvas.width = width;
    canvas.height = height;

    context = canvas.getContext( '2d' );
    context.fillStyle = '#000';
    context.fillRect( 0, 0, width, height );

    image = context.getImageData( 0, 0, canvas.width, canvas.height );
    imageData = image.data;

    for ( var i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {

        vector3.x = data[ j - 2 ] - data[ j + 2 ];
        vector3.y = 2;
        vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
        vector3.normalize();

        shade = vector3.dot( sun );

        imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
        imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
        imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
    }

    context.putImageData( image, 0, 0 );

    // Scaled 4x

    canvasScaled = document.createElement( 'canvas' );
    canvasScaled.width = width * 4;
    canvasScaled.height = height * 4;

    context = canvasScaled.getContext( '2d' );
    context.scale( 4, 4 );
    context.drawImage( canvas, 0, 0 );

    image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
    imageData = image.data;

    for ( var i = 0, l = imageData.length; i < l; i += 4 ) {

        var v = ~~ ( Math.random() * 5 );

        imageData[ i ] += v;
        imageData[ i + 1 ] += v;
        imageData[ i + 2 ] += v;

    }

    context.putImageData( image, 0, 0 );
    shadingImage = image;
    return canvasScaled;

}
function getRand(max){
    var seed = Math.random()*max;
    return seed;
}

function getRandMinMax(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
window.onload = init;