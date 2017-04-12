var dataVolume;


window.addEventListener("message", function (event) {
    var curAction = event.data;

    dataVolume = curAction.draw;
    if (!(App.noAnimate = !dataVolume))App.Animate();

    if (dataVolume) {
        App.startApp();
        App.exitStart = true;
        jQuery('#dark-screen').css('display', 'block').fadeOut(3000);
        App.isTHreeTimesNeedClicked = false;
        setTimeout(function () {
            //jQuery('#dark-screen').fadeIn(3000);
            App.tHreeTimesNeedClickedInterval = 200;
        }, 40 * 1000);
        App.tempTimeOut1 = setTimeout(function () {
            if(App.exitStart == false){
                clearTimeout(App.tempTimeOut2);
            }
            App.dbClickStart = 0;
            App.tHreeTimesNeedClickedInterval = 0;
            jQuery('#dark-screen').fadeIn(3000);
            parent.postMessage("GO_TO_THREE_CHAPTER", "/");
            setTimeout(function(){
                window.isEffectAreLoading =   false;
                App.aupdateChildEffects();
            },4*1000)
        }, 60 * 1000);
        brightnessVal = 0;
        App.Animations.drop(App.outro);
        //App.Animations.add(App.intro);
    } else {
        App.Animations.drop(App.intro);
    }

    App.AmbientSound[dataVolume ? 'play' : 'pause']();
}, false);


var App = App || {
        mouse: new THREE.Vector2,
        mousePrev: new THREE.Vector2,
        mouseGap: new THREE.Vector2,
        mouseMove: !1,
        mouseDown: !1,
        mouseUp: !1,
        mousePath: {
            powerFactor: .1,
            direction: new THREE.Vector2,
            last: new THREE.Vector2,
            start: new THREE.Vector2,
            end: new THREE.Vector2,
            getPath: function () {
                var a = new THREE.Vector2;
                a.subVectors(App.mousePath.start, App.mousePath.end);
                return a
            }
        },
        raycaster: new THREE.Raycaster,
        offset: new THREE.Vector3,
        sphere: {
            friction: 100,
            frictionAction: new Instruction,
            container: {},
            xRotationSpeed: 0,
            yRotationSpeed: 0,
            yRotationDelta: 0,
            mouseDownPoint: new THREE.Vector2
        },
        frame: 0,
        frameDir: 1,
        Zoom: {
            min: .45,
            max: 0.95,
            // step: .0025, //disable mouse zoom
            current: 0.4 //0.95
        }
    };
App.Scoop = {
    _storage: {},
    _intersect: [],
    add: function (a) {
        if (a && !a.cid) return a.cid = this.cid(), this._storage[a.cid] = a, a.category && this._[a.category].push(a), a.onChangePosition && (App.Events.stack.onChangePosition[a.cid] = a), a.onClick && (App.Events.stack.onClick[a.cid] = a), a.cid
    },
    get: function (a) {
        if (this._storage[a]) return this._storage[a]
    },
    destroy: function (a) {
        this._storage[a] && delete this._storage[a]
    },
    cid: function () {
        var a = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890".slice(""),
            b = "";
        do
            for (var c =
                0; c < a.length; c++) b += a[Math.round(Math.random() * a.length)]; while (this._storage[b]);
        return b
    },
    _: {
        plane: [],
        point: [],
        line: []
    }
};
App.Animations = new Instruction();
App.toScene = function (a) {
    App.scene.add(a)
};
App.Events = {
    stack: {
        onChangePosition: {},
        intersected: [],
        firstObject: {},
        Selected: {},
        Hovered: {}
    },
    MouseDown: function (a) {
        a && a.preventDefault();
        App.mouseDown = !0;
        App.Events.INTER(a);
        App.mousePath.start = App.mouse.clone()
    },
    MouseMove: function (a) {
        a && a.preventDefault();
        App.mouseMove = !0;
        App.Events.MouseResetPosition(a);
        App.QuaterSphere.mouseMove();
    },
    MouseUp: function (a) {
        a && a.preventDefault();
        App.mouseDown = !1;
        App.mouseMoove = !1;
        App.mousePath.end = App.mouse.clone();
        App.mousePath.last = App.mousePath.getPath();
        App.sphere.currentFrictionStep = 0;
        App.sphere.frictionAction.set(function () {
            if (App.sphere.currentFrictionStep < App.sphere.friction) {
                var a = Extra.getSinSlerp(App.sphere.currentFrictionStep, App.sphere.friction),
                    a = new THREE.Quaternion((1 - a) * App.mousePath.last.y * App.mousePath.powerFactor, -((1 - a) * App.mousePath.last.x * App.mousePath.powerFactor), 0, 1),
                    c = App.QuaterSphere.quaternion.clone();
                App.QuaterSphere.quaternion.multiplyQuaternions(a, c);
                App.QuaterSphere.quaternion.normalize();
                App.sphere.currentFrictionStep++;
                App.sphere.inAction = !0
            } else App.sphere.inAction = !1, App.mousePath.direction = new THREE.Vector2, App.sphere.frictionAction.drop()
        })
    },
    MouseWheel: function (a) {

        // if (a) {
        //     a.preventDefault();
        //     a = 0 < a.deltaY ? 1 : -1;
        //     var b = a * App.Zoom.step;
        //     a && 0 < a && App.Zoom.current < App.Zoom.max && (App.Zoom.current += b);
        //     a && 0 > a && App.Zoom.current > App.Zoom.min && (App.Zoom.current += b)
        // }
    },
    on: function (a, b) {
        b && b.obj[a] && b.obj[a].run(b)
    },
    MouseResetPosition: function (a) {
        a.offsetX = a.offsetX ? a.offsetX : a.clientX;
        a.offsetY = a.offsetY ? a.offsetY : a.clientY;
        App.mousePrev.copy(App.mouse);
        App.mouse.set(a.offsetX / App._SW() * 2 - 1, -(a.offsetY / App._SH() * 2) + 1);
        App.mouseGap.subVectors(App.mouse, App.mousePrev)
    },
    INTER: function (a) {
        App.raycaster.setFromCamera(App.mouse, App.camera);
        return App.raycaster.intersectObjects(App.Scoop._intersect, !1)
    },
    Resize: function () {
        App.gl.setSize(App._SW(), App._SH());
        App.camera.aspect = App._SW() / App._SH();
        App.camera.updateProjectionMatrix()
    },
    Listen: function () {
        var a = App.gl.domElement;
        a.addEventListener("mouseup", App.Events.MouseUp, !1);
        a.addEventListener("mousedown", App.Events.MouseDown, !1);
        a.addEventListener("mousemove", App.Events.MouseMove, !1);
        a.addEventListener ? "onwheel" in document ? a.addEventListener("wheel", App.Events.MouseWheel) : "onmousewheel" in document ? a.addEventListener("mousewheel", App.Events.MouseWheel) : a.addEventListener("MozMousePixelScroll", App.Events.MouseWheel) : a.attachEvent("onmousewheel", App.Events.MouseWheel);
        window.addEventListener("resize", App.Events.Resize, !1)
    },
    checkEvents: function () {
        App.Animations.run();
        App.sphere.frictionAction.run()
    }
};


var textVideo = [];
App.run = function (a) {
    if ("string" == typeof a && null != document.getElementById(a)) {
        var b = App.container = document.getElementById(a);
        App.scene = new THREE.Scene;
        App._SW = function () {
            return b.offsetWidth
        };
        App._SH = function () {
            return b.offsetHeight
        };
        VIEW_ANGLE = 15;
        ASPECT = App._SW() / App._SH();
        NEAR = .1;
        FAR = 15E3;
        App.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        App.toScene(App.camera);
        App.camera.position.set(-600, 0, 388);
        App.vectorStart = new THREE.Vector3(0, 0, 400);

        App.camera.lookAt(App.vectorStart);
        // App.controls = new THREE.OrbitControls(App.camera);
        // App.controls.enable = !1;
        App.gl = Detector.webgl ? new THREE.WebGLRenderer({
            clearColor: 65280,
            alpha: !0,
            clearAlpha: 1,
            antialias: !0,
            sortObjects: !1
        }) : new THREE.CanvasRenderer;
        App.gl.setSize(App._SW(), App._SH());
        App.gl.sortObjects = !1;
        //App.gl.setClearColor( 0x000000, 0 );
        b.appendChild(App.gl.domElement);
        App.scene.fog = new THREE.FogExp2(0, 1.65E-4);
        App.ambientLight = new THREE.AmbientLight('#ffe6cc');
        App.toScene(App.ambientLight);
        App.ambLight = new THREE.AmbientLight('#ffffff');
        App.ambLight2 = new THREE.AmbientLight('#ffffff');
        App.hemisphereLight = new THREE.HemisphereLight('#666', '#666', .3);
        App.toScene(App.hemisphereLight);
        App.hemisphereLight.position.set(1,
            0, 0);
        // App.hemisphereLight2 = new THREE.HemisphereLight('#ffffff', 3368601, .3);
        // App.toScene(App.hemisphereLight2);
        // App.hemisphereLight2.position.set(0, 1, 0);
        App.pointLight = new THREE.PointLight(13421823, .9);
        App.toScene(App.pointLight);
        App.pointLight.position.set(0, 100, 50);
        //App.controls = new THREE.TrackballControls(App.camera, App.gl.domElement);


        App.Events.Listen()
    }


    var clock = new THREE.Clock();
    (App.Animate = function () {
        if (App.noAnimate)return App.AmbientSound.pause();
        App.frame += 1;

        App.camera.scale.set(App.Zoom.current, App.Zoom.current, 1);
        App.gl.render(App.scene, App.camera);
        App.Events.checkEvents();

        if (App.controls && App.controls.enabled) {
            App.controls.update();
        }
        if (App.uniforms2) {
            var delta = clock.getDelta();
            //App.uniforms2.time.value = clock.elapsedTime;
            App.uniforms2.time.value += delta * 0.85;
        }
        if (TWEEN)TWEEN.update();
        requestAnimationFrame(App.Animate);
    })(App.Animate);


    return App
};


// var clickKey = false;
var brightnessVal = 100;
var spaceFlag = false;
window.parent.onkeydown = function (event) {
    if (event.keyCode == 32) {
        if (spaceFlag == false) {
            brightnessVal = 100;
            App.Animations.drop(App.intro);
            App.Animations.add(App.outro);
            spaceFlag = true;
        }

    }
};

window.parent.onkeyup = function (event) {
    if (event.keyCode == 32) {
        if (spaceFlag == true) {
            brightnessVal = 0;
            App.Animations.drop(App.outro);
            App.Animations.add(App.intro);
            spaceFlag = false;
        }

    }
};


var mouseX;
var mouseY;
var mousemoveX;

App.AmbientSoundClick = new Howl({
    urls: ["sound/click.wav"],
    loop: false,
    volume: .7
});
App.AmbientSoundDragLeft = new Howl({
    urls: ["sound/drag.wav"],
    loop: false,
    volume: .3
});
App.AmbientSoundDragRight = new Howl({
    urls: ["sound/drag2.wav"],
    loop: false,
    volume: .3
});

var sourceAudio = [
    {count: 10, name: "sound/CLICK/click",v:1.0},
    {count: 5, name: "sound/drag/drag",v:0.25}
];
App.Media = {};
sourceAudio.forEach(function (o) {
    var name = o.name.split("/");
    name =  name[ name.length-1];
    App.Media[name] = [];
    App.Media[name+"Iter"] = 1;
    for (var i = 1; i < o.count; i++) {
        App.Media[name].push(new Howl({
            urls: [o.name + i + '.mp3'],
            loop: false,
            volume: o.v
        }));
    }
});


var previousPoint;
var leftdir = true;
var direction = true;
var zoomInFlag = true;
var zoomOutFlag = true;
var startStep = 1;
var finishStep = 300;
var speedZoom = 0.5;
var presentZoom;

App.zoomIn = function () {
    if (App.Zoom.current < App.Zoom.max) {
        App.Zoom.current = presentZoom + speedZoom * (Math.sin(Math.PI / 2 * (startStep / finishStep)));
        startStep++;
    }
    if (App.Zoom.current > 0.94) {
        App.Animations.drop(App.zoomIn);
    }
};


App.zoomOut = function () {
    if (App.Zoom.current > App.Zoom.min) {
        App.Zoom.current = presentZoom - 0.5 * ( Math.sin(Math.PI / 2 * (startStep / finishStep)));
        startStep++;
    }
    if (App.Zoom.current < 0.46) {
        App.Animations.drop(App.zoomOut);
    }
};

function autoZoom(event) {

    //window.isEffectAreLoading = event.deltaY < 0;


    finishStep = /*App.mouseDownZoom && event.deltaY < 0 ? 600 :*/ 300;
    speedZoom = /*event.isFinish ? 1.5 :*/ 0.5;

    if (event.deltaY < 0) {
        App.Animations.drop(App.zoomIn);
        zoomInFlag = true;
        if (App.Zoom.current > App.Zoom.min) {
            if (zoomOutFlag) {
                zoomOutFlag = false;
                App.Animations.drop(App.zoomIn);
                startStep = 1;
                presentZoom = App.Zoom.current;
                App.Animations.add(App.zoomOut);
            }
        }

    }
    if (event.deltaY > 0) {
        App.Animations.drop(App.zoomOut);
        zoomOutFlag = true;
        if (App.Zoom.current < App.Zoom.max) {
            if (zoomInFlag) {
                zoomInFlag = false;
                App.Animations.drop(App.zoomOut);
                startStep = 1;
                presentZoom = App.Zoom.current;
                App.Animations.add(App.zoomIn);
            }
        }

    }
}


function dragSound(event) {
    mousemoveX = event.clientX || event.pageX;
    var mousemoveY = event.clientY || event.pageY;

    if (mouseX != mousemoveX || mouseY != mousemoveY) {
        App.scene.remove(App.ambLight);
        App.scene.remove(App.ambLight2);
    }


    /*
     if (mousemoveX < previousPoint) {
     if (direction) {
     //App.AmbientSoundDragRight.stop();
     //App.AmbientSoundDragLeft.stop();
     App.AmbientSoundDragLeft.play();
     //App.AmbientSoundDragRight.pause();
     }
     direction = false;
     } else {

     if (leftdir) {
     App.AmbientSoundDragRight.play();
     leftdir = false;
     }
     if (!direction) {
     //App.AmbientSoundDragRight.stop();
     //App.AmbientSoundDragLeft.stop();
     //App.AmbientSoundDragLeft.pause();
     App.AmbientSoundDragRight.play();
     }
     direction = true;
     }*/

    App.Media.dragIter = App.Media.dragIter <  App.Media['drag'].length? App.Media.dragIter:0;
    App.Media['drag'][App.Media.dragIter++].play();
    previousPoint = mousemoveX;
}

function changeLight(event) {
    App.scene.remove(App.ambLight);
    App.scene.remove(App.ambLight2);
    window.removeEventListener('mousemove', dragSound, true);
    //autoZoom({deltaY: 1, isFinish: 1});
    //App.mouseDownZoom = !1;
    //App.aupdateChildEffects();
    if (window.isEffectAreLoading) DBClick({isStartAn: true});
}
App.changeLight = function () {
    changeLight();
}
App.aupdateChildEffects = function (noneedToDraw) {

    var parent = document.getElementById('effects'),
        curIframe = parent.children[0],
        efect = curIframe.contentWindow,
        needRefresh = window.isEffectAreLoading;

    if (efect) {
        efect.isAnimating = noneedToDraw ? false : needRefresh;
        efect.animate();

        if (!noneedToDraw) {
            if (window.isEffectAreLoading) {
                parent.style.zIndex = 3;
                parent.style.display = "";
            } else {
                parent.style.display = "none";
                parent.style.zIndex = -999;
            }
        }
        App.noAnimate = needRefresh;
        if (App.needAnimate) {
            App.needAnimate = false;
            App.Animate();
        }
    }
}
App.pauseContet = function () {
    App.lastIsEffectAreLoading = window.isEffectAreLoading;
    window.isEffectAreLoading = true;
    App.aupdateChildEffects(1);
}
App.playContet = function () {
    window.isEffectAreLoading = App.lastIsEffectAreLoading;
    App.needAnimate = true;
    App.AmbientSound.play();
    App.aupdateChildEffects();
}
App.mouse3Dposition = {};
App.cameraPlane = {};
var raycaster = new THREE.Raycaster();
App.get3Dposition = function (event) {
    var mouse_x = ( event.clientX / window.innerWidth ) * 2 - 1;
    var mouse_y = -( event.clientY / window.innerHeight ) * 2 + 1;

    var vector = new THREE.Vector3(mouse_x, mouse_y, 0.5);
    //App.projectorForMouse.unprojectVector( vector, App.camera );

    //var raycaster = new THREE.Raycaster( App.camera.position, vector.sub( App.camera.position ).normalize() );
    raycaster.set(App.camera.position, vector.sub(App.camera.position).normalize())
    var intersected = raycaster.intersectObjects([App.skyBox, App.mainsphere], true);
    //App.mouse3Dposition = intersected[0];
    App.mouse3DpositionC = intersected[0];
    //if (App.mouseDownZoom)autoZoom({deltaY: 1, isFinish: 1});
};

window.addEventListener('mousemove', App.get3Dposition, true);

document.body.addEventListener('dblclick', DBClick);

App.DBClickSound = new Howl({
    urls: ["sound/double_click.mp3"],
    loop: false,
    volume: 1.0
});
function DBClick(ev) {
    App.dbClickStart = Date.now();
    App.DBClickSound.play();
    setTimeout(function () {
        var isStartAn = ev.isStartAn;
        window.isEffectAreLoading = isStartAn ? false : true;
        App.needAnimate = true;
        App.aupdateChildEffects();

        App.AmbientSound[isStartAn ? 'play' : 'pause']();
    }, App.tHreeTimesNeedClickedInterval | 0);

    if(App.exitStart == true){
        App.exitStart = false;
        App.tempTimeOut2 = setTimeout(function () {
            clearTimeout(App.tempTimeOut1);
            App.dbClickStart = 0;
            App.tHreeTimesNeedClickedInterval = 0;
            jQuery('#dark-screen').fadeIn(3000);
            parent.postMessage("GO_TO_THREE_CHAPTER", "/");
            setTimeout(function(){
                window.isEffectAreLoading =   false;
                App.aupdateChildEffects();
            },4*1000)
        }, 40 * 1000);
    }

}
window.addEventListener('mousedown', function () {

    // if (App.tHreeTimesNeedClickedInterval > 0 && Date.now() - App.dbClickStart < 150) {//
    //     clearTimeout(App.tempTimeOut1);
    //     App.dbClickStart = 0;
    //     App.tHreeTimesNeedClickedInterval = 0;
    //     jQuery('#dark-screen').fadeIn(3000);
    //     parent.postMessage("GO_TO_THREE_CHAPTER", "/");
    //     setTimeout(function(){
    //         window.isEffectAreLoading =   false;
    //         App.aupdateChildEffects();
    //     },4*1000)
    // }

    mouseY = event.clientY || event.pageY;
    mouseX = event.clientX || event.pageX;


    App.AmbientSoundClick.currentTime = 0;
    App.Media.clickIter = App.Media.clickIter < App.Media['click'].length? App.Media.clickIter:0;
    App.Media['click'][App.Media.clickIter++].play();
    App.toScene(App.ambLight);
    App.toScene(App.ambLight2);
    window.addEventListener('mousemove', dragSound, true);

    /*if (App.mouse3DpositionC && App.mouse3DpositionC.object.category == "sphere" && !App.startZoom) {
     App.startZoom = !0;
     App.mouseDownZoom = !0;
     setTimeout(function () {
     App.startZoom = !1;
     if (!App.mouseDownZoom)return;
     autoZoom({deltaY: -1});
     setTimeout(function () {
     App.mouseDownZoom = !1;
     App.aupdateChildEffects();
     App.needAnimate = true;
     }, 2000)
     }, 1000)

     }*/

}, true);

window.addEventListener('mouseup', changeLight, true);
// window.addEventListener('mousewheel', autoZoom, true);

App.run("THREEJS");
var pathPref = "img/c1/tempnew/", // img/c1/new/
    pathSuff = ".jpg",
    sphereTexture = [];

App.textureLoader = new THREE.TextureLoader();
Extra.Repeat(20, function (a) {
    var b = new function () {
        var b = this;
        b.number = a;
        var map = {}
        b.map = App.textureLoader.load(pathPref + a + pathSuff);
        ;
        b.map.minFilter = THREE.LinearFilter;
        b.map.getFrameNumber = function () {
            return b.number
        };
        b.specular = map;
        b.specular.minFilter = THREE.LinearFilter
    };
    sphereTexture.push(b)
}, function () {
    function a() {
        App.Animations.add(function () {
            App.frame += 1;
            if (0 == App.frame % 3) {
                var a = e.material.map.getFrameNumber();
                11 > a && 1 == App.frameDir ? (e.material.map = sphereTexture[a +
                1].map, e.material.specularMap = sphereTexture[a + 1].specular) : 11 == a && (e.material.map = sphereTexture[a].map, e.material.specularMap = sphereTexture[a].specular, App.frameDir = -1);
                0 < a && -1 == App.frameDir ? (e.material.map = sphereTexture[a - 1].map, e.material.specularMap = sphereTexture[a - 1].specular) : 0 == a && (e.material.map = sphereTexture[a + 1].map, e.material.specularMap = sphereTexture[a + 1].specular, App.frameDir = 1)
            }
        })
    }

    App.sphere.folowQuaterSphere = function () {
        App.sphere.containerX.quaternion.clone();
        var a = App.QuaterSphere.quaternion.clone();
        App.sphere.containerX.quaternion.copy(a);
        App.sphere.containerX.quaternion.normalize()
    };
    var b = new THREE.CylinderGeometry(450, 450, 900, 64, 1, !0, Math.PI / 2, Math.PI),
        c = new THREE.MeshPhongMaterial({
            side: THREE.BackSide
        }),
        b = new THREE.Mesh(b, c);
    b.position.set(0, 0, -430);
    b.rotation.z = Math.PI;
    b.material.map = App.textureLoader.load("img/newtexturebackground2.jpg");
    b.material.map.minFilter = THREE.LinearFilter;
    b = new THREE.Object3D;
    App.sphere.containerX = b;
    App.toScene(b);
    var d = new THREE.Object3D;
    App.sphere.containerY = d;
    App.sphere.containerX.add(d);
    b = new THREE.SphereGeometry(50, 52, 52);
    c = new THREE.MeshPhongMaterial;
    c.map = sphereTexture[1].map;
    c.transparent = !0;
    c.shininess = 2;
    c.opacity = .9;
    var e = new THREE.Mesh(b, c);
    e.category = "sphere";
    App.mainsphere = e;

    App.Scoop._intersect.push(e);
    d.add(e);
    // var b = new THREE.SphereGeometry(30.8, 32, 32), // black border around the sphere
    g = new THREE.CubeCamera(.1, 5E3, 512);
    App.toScene(g);
    c = THREE.FresnelShader;
    c = new THREE.ShaderMaterial({
        uniforms: {
            mRefractionRatio: {
                type: "f",
                value: 1.02
            },
            mFresnelBias: {
                type: "f",
                value: .1
            },
            mFresnelPower: {
                type: "f",
                value: 2
            },
            mFresnelScale: {
                type: "f",
                value: 1
            },
            tOpacity: {
                type: "f",
                value: .7
            },
            tCube: {
                type: "t",
                value: g.renderTarget
            }
        },
        vertexShader: c.vertexShader,
        fragmentShader: c.fragmentShader
    });
    c.transparent = !0;
    c.opacity = 1;
    b = new THREE.Mesh(b, c);
    e.add(b);
    g.position = b.position;

    var geometry = new THREE.SphereGeometry(2E3, 32, 32);
    //var geometry =   new THREE.CubeGeometry( 2E3, 2E3, 2E3, 1, 1, 1, null, true ) ;

    var material = new THREE.MeshLambertMaterial({color: '#ffffff'});
    material.map = App.textureLoader.load('img/texturebacksphere.jpg');
    material.side = THREE.DoubleSide;
    material.needsUpdate = true;
    App.skyBox = new THREE.Mesh(geometry, material);
    App.toScene(App.skyBox);


    var planeSize = 100;
    var rad = 110;
    var geometry = new THREE.SphereBufferGeometry(rad, 32, 32);

    var listT = [];

    var imagePrefix = 'img/texturetwoelements/twoelementss_013';
    var imageSuffix = ".jpg";
    for (var i = 65; i < 70; i++) {
        listT.push(imagePrefix + i + imageSuffix);
    }
    var loaderImg = new THREE.TextureLoader();
    for (var i = 65; i < 80; i++) {
        textVideo.push(loaderImg.load(imagePrefix + i + imageSuffix));
    }
    var textureCube = new THREE.CubeTextureLoader().load(listT);
    textureCube.mapping = THREE.CubeRefractionMapping;


    material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        envMap: textureCube,
        refractionRatio: 0.89,
        transparent: true,
        opacity: 0.69
    });

    for (var i = 0; i < 1; i++) {

        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.z = -10 * rad;//Math.random() * 10000 - 5000;
        mesh.scale.set(10, 2, 1);
        App.camera.add(mesh);
    }


    var d = 35,
        b = new THREE.SphereGeometry(d, 32, 32),
        f = new THREE.SphereGeometry(.5, 32, 32),
        c = new THREE.MeshPhongMaterial({
            wireframe: !0,
            transparent: !0,
            opacity: .05
        }),
        h = new THREE.MeshPhongMaterial({
            color: 16776960
        });
    App.QuaterSphere = new THREE.Mesh(b, c);

    //App.controls = new THREE.TrackballControls(App.camera, App.gl.domElement, App.QuaterSphere);
    //App.controls.rotateSpeed = 10.0;
    //App.controls.dynamicDampingFactor = 0.2;
    //App.controls.enabled = !1;

    App.QuaterSphere.mouseMove = function () {
        if (App.mouseDown) {
            App.mousePath.end = App.mouse.clone();
            var a = App.mousePath.getPath(),
                a = new THREE.Quaternion(a.y * App.mousePath.powerFactor, -(a.x * App.mousePath.powerFactor), 0, 1),
                b = App.QuaterSphere.quaternion.clone();
            App.QuaterSphere.quaternion.multiplyQuaternions(a, b);
            App.QuaterSphere.quaternion.normalize()
        }
    };
    App.QuaterSphere.Hotpoint = new THREE.Mesh(f, h);
    App.QuaterSphere.Hotpoint.position.z = d * Math.sin(.15 * Math.PI);
    App.QuaterSphere.Hotpoint.position.y = d * Math.cos(.15 * Math.PI);
    App.QuaterSphere.add(App.QuaterSphere.Hotpoint);
    App.toScene(App.QuaterSphere);
    d = 35.3;
    b = new THREE.SphereGeometry(d, 32, 32);
    f = new THREE.SphereGeometry(3, 32, 32);
    c = new THREE.MeshPhongMaterial({
        color: 65535,
        wireframe: !0,
        transparent: !0,
        opacity: .05
    });
    h = new THREE.MeshPhongMaterial({
        color: 16711935,
        transparent: !0,
        opacity: .3
    });
    App.HotpointSensor = new THREE.Mesh(b, c);
    App.HotpointSensor.maxDistance = 2 * d;
    App.HotpointSensor.distaceToHotpoint = 0;
    App.HotpointSensor.distanceFactor = 0;
    App.HotpointSensor.distanceFactorLast = 0;
    App.HotpointSensor.distanceFactorTotal = 0;
    App.HotpointSensor.massCritical = 100;
    App.HotpointSensor.massCurrent = 0;
    App.HotpointSensor.massJustNulled = !1;
    App.HotpointSensor.massJustMaximum = !1;
    var flagPoint = false;
    var startInterval = true;
    var frameTime = 0;
    //App.projectorForMouse = new THREE.Projector();

    App.HotpointSensor.massDec = function () {
        startInterval = true;
        flagPoint = false;
        0 < App.HotpointSensor.massCurrent ? (App.HotpointSensor.massJustMaximum && (App.HotpointSensor.massJustMaximum = !1), App.HotpointSensor.massCurrent--) : App.HotpointSensor.massJustNulled || (App.HotpointSensor.massJustNulled = !0, App.HotpointSensor.massNulled())
    };
    App.HotpointSensor.massInc = function () {
        flagPoint = true;

        if (startInterval) {
            startInterval = false;
            var interval = setInterval(function () {
                if (flagPoint) {
                    frameTime += 100;
                    if (frameTime >= 1500) {
                        var iframeBtn = $("#iframeBtn", window.parent.document);
                        iframeBtn.fadeIn(2000);
                        frameTime = 0;
                        clearInterval(interval);
                    }
                } else {
                    clearInterval(interval);
                    startInterval = true;
                    frameTime = 0;
                }
            }, 100);
        }
        App.HotpointSensor.massCurrent < App.HotpointSensor.massCritical ? (App.HotpointSensor.massJustNulled && (App.HotpointSensor.massJustNulled = !1), App.HotpointSensor.massCurrent++) : App.HotpointSensor.massJustMaximum ||
        (App.HotpointSensor.massJustMaximum = !0, App.HotpointSensor.massMaximum())
    };
    App.HotpointSensor.massNulled = function () {
    };
    App.HotpointSensor.massMaximum = function () {
    };
    App.HotpointSensor.recalculateDistance = function (a) {
        App.QuaterSphere.updateMatrixWorld();
        a = new THREE.Vector3;
        a.setFromMatrixPosition(App.QuaterSphere.Hotpoint.matrixWorld);
        App.HotpointSensor.updateMatrixWorld();
        var b = new THREE.Vector3;
        b.setFromMatrixPosition(App.HotpointSensor.Point.matrixWorld);
        App.HotpointSensor.distaceToHotpoint = b.distanceTo(a)
    };
    App.HotpointSensor.envControllerAction = !1;

    App.HotpointSensor.envController = function () {
        var a = App.HotpointSensor.distanceFactorLast,
            b = Math.sin(App.HotpointSensor.distanceFactorTotal / 2),
            b = 0 < b ? b : -b,
            c = .4 + .6 * b,
            d = .4 + .6 * b,
            e = .1 + .9 * b,
            b = .7 + .3 * b;
        // App.ambientLight.color = new THREE.Color(c, c, c);

        App.pointLight.intensity = 1;
        App.hemisphereLight.intensity = 1;
        // App.hemisphereLight2.intensity = 1;

        App.AmbientSound.volume(dataVolume || e);
    };

    window.addEventListener('mousedown', function (event) {

        App.HotpointSensor.envController = function () {
            var a = App.HotpointSensor.distanceFactorLast,
                b = Math.sin(App.HotpointSensor.distanceFactorTotal / 2),
                b = 0 < b ? b : -b,
                c = .4 + .6 * b,
                d = .4 + .6 * b,
                e = .1 + .9 * b,
                b = .7 + .3 * b;
            // App.ambientLight.color = new THREE.Color(c, c, c);

            App.pointLight.intensity = d;
            App.hemisphereLight.intensity = e;
            // App.hemisphereLight2.intensity = e;

            App.AmbientSound.volume(dataVolume || e);
        };


    }, true);


    window.addEventListener('mouseup', function (event) {
        App.HotpointSensor.envController = function () {
            var a = App.HotpointSensor.distanceFactorLast,
                b = Math.sin(App.HotpointSensor.distanceFactorTotal / 2),
                b = 0 < b ? b : -b,
                c = .4 + .6 * b,
                d = .4 + .6 * b,
                e = .1 + .9 * b,
                b = .7 + .3 * b;
            // App.ambientLight.color = new THREE.Color(c, c, c);

            App.pointLight.intensity = 1;
            App.hemisphereLight.intensity = 1;
            // App.hemisphereLight2.intensity = 1;

            App.AmbientSound.volume(dataVolume || e);
        };
    }, true);


    App.HotpointSensor.checkDistancePerFrame = function () {
        12 > App.HotpointSensor.distaceToHotpoint ? App.HotpointSensor.massInc() : 12 <= App.HotpointSensor.distaceToHotpoint && 0 <= App.HotpointSensor.massCurrent && App.HotpointSensor.massDec();
        App.HotpointSensor.distanceFactor = 1 / App.HotpointSensor.maxDistance * (App.HotpointSensor.maxDistance - App.HotpointSensor.distaceToHotpoint);
        App.HotpointSensor.distanceFactorTotal += App.HotpointSensor.distanceFactor;
        if (App.sphere.inAction || App.mouseMove &&
            App.mouseDown) {
            if (!App.HotpointSensor.envControllerAction) {
                App.HotpointSensor.envControllerAction = !0;
                var a;
                a = setTimeout(function () {
                    App.HotpointSensor.distanceFactorLast = App.HotpointSensor.distanceFactor;
                    clearTimeout(a);
                    App.HotpointSensor.envControllerAction = !1
                }, 50)
            }
        } else App.HotpointSensor.distanceFactorLast = App.HotpointSensor.distanceFactor;
        App.HotpointSensor.envController();

    };


    App.Animations.add(App.HotpointSensor.checkDistancePerFrame);
    App.HotpointSensor.Point = new THREE.Mesh(f, h);
    App.HotpointSensor.Point.position.z = d;
    App.HotpointSensor.add(App.HotpointSensor.Point);
    App.toScene(App.HotpointSensor);
    App.HotpointSensor.recalculateDistance();
    App.helpersVisible = function (a) {
        App.QuaterSphere.visible = a;
        App.QuaterSphere.Hotpoint.visible = a;
        App.HotpointSensor.visible = a;
        App.HotpointSensor.Point.visible = a
    };
    App.helpersVisible(!1);
    var angles = 0;
    var radiuss = 400;
    var posYRot = false;

    App.intro = function () {
        document.getElementById('THREEJS').style.filter = "brightness(" + brightnessVal + "%)";
        document.getElementById('THREEJS').style.WebkitFilter = "brightness(" + brightnessVal + "%)";
        if (brightnessVal < 100) {
            brightnessVal += 1;
        }
        if (brightnessVal < 10) {
            App.camera.position.set(-600, 0, 388);
            App.vectorStart = new THREE.Vector3(0, 0, 400);
            posYRot = false;
            angles = 0;
        }
    };
    App.outro = function () {
        document.getElementById('THREEJS').style.filter = "brightness(" + brightnessVal + "%)";
        document.getElementById('THREEJS').style.WebkitFilter = "brightness(" + brightnessVal + "%)";
        if (brightnessVal > 0) {
            brightnessVal -= 1;
        }
    };


    // var planeMaterial = new THREE.MeshLambertMaterial({ color: '#fff' });
    // var cameraPlane = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), planeMaterial);
    // cameraPlane.position.z = -200;
    // cameraPlane.material.visible = false;
    // App.cameraPlane = cameraPlane;
    // App.camera.add(cameraPlane);


    App.spheresCursor = [];

    var toggle = 0;

    var spheresIndex = 0;

    var clock = new THREE.Clock();

    var sphereGeometry = new THREE.SphereGeometry(1, 16, 16);
    var sphereMaterial = new THREE.MeshBasicMaterial({
        shading: THREE.FlatShading, map: new new THREE.TextureLoader().load("img/grad1.png"),
        transparent: true,
        opacity: 0.8
    });

    for (var i = 0; i < 20; i++) {

        var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        App.scene.add(sphere);
        App.spheresCursor.push(sphere);

    }


    App.startApp = function () {
        App.camera.position.set(-200, 0, 388);
        App.vectorStart = new THREE.Vector3(0, 0, 400);
        App.readyToRotate = !1;
        angles = 0;
        radiuss = 400;
        posYRot = false;

        var cmrSt = App.camera.position,
            bgnPst = cmrSt,//{x:cmrSt.x,y:cmrSt.y,z:cmrSt.z},
            endPnt = {x: radiuss * Math.sin(angles), z: radiuss * Math.cos(angles), y: 0},
            delta = 1 / 10000;
        //App.camera.position.set(endPnt.x,endPnt.y,endPnt.z);
        //App.camera.lookAt(App.vectorStart);
        var tweenA = [
            {bgn: cmrSt, end: endPnt},
            {bgn: App.vectorStart, end: {x: 0, y: 0, z: 0}},

        ], iter = 0;

        (function anim(list, delay) {
            if (!list || !list.length) return;
            var cur = list.shift(),
                distan = cur.bgn.distanceTo(cur.end),
                tween = new TWEEN.Tween(cur.bgn).to(cur.end, delay).onUpdate(function () {
                    var usFinnish = this.distanceTo(cur.end) < delta;
                    if (
                        usFinnish
                    ) {
                        //tween.stop();
                        App.readyToRotate = ++iter > 1;
                    } else if (this.x > -200) {
                        anim(list, 5000);
                    }

                    App.camera.lookAt(App.vectorStart);
                }).easing(TWEEN.Easing.Linear.None).start();


        })(tweenA.concat([]), 5000);

    }

    App.Animations.add(function () {

        if (App.mouse3Dposition.object) {
            if (toggle > 0.01) {

                App.spheresCursor[spheresIndex].position.copy(App.mouse3Dposition.point);

                if (App.mouse3Dposition.object == App.mainsphere) {
                    App.spheresCursor[spheresIndex].scale.set(1, 1, 1);
                } else {
                    App.spheresCursor[spheresIndex].scale.set(5, 5, 5);
                }
                spheresIndex = ( spheresIndex + 1 ) % App.spheresCursor.length;

                toggle = 0;

            }

            if (App.mouse3Dposition.object == App.mainsphere) {
                for (var i = 0; i < App.spheresCursor.length; i++) {

                    var sphere = App.spheresCursor[i];
                    sphere.scale.multiplyScalar(0.95);
                    sphere.scale.clampScalar(0.01, 1);

                }
            } else {
                for (var i = 0; i < App.spheresCursor.length; i++) {

                    var sphere = App.spheresCursor[i];
                    sphere.scale.multiplyScalar(0.95);
                    sphere.scale.clampScalar(0.01, 5);

                }
            }

        }
        toggle += clock.getDelta();

        if (App.readyToRotate) {

            App.camera.position.x = radiuss * Math.sin(angles);
            App.camera.position.z = radiuss * Math.cos(angles);

            angles += 0.0005;

            if (App.mouse.y < 0.01 && App.mouse.y > -0.01) {
                // posYRot = true; // enable mousemove zoom
            }

            if (posYRot == true) {
                App.camera.position.y += 400 * App.mouse.y - App.camera.position.y;
            }
            App.camera.lookAt(App.scene.position);
        }


        if (App.sphere.inAction || App.mouseMove && App.mouseDown) {
            App.sphere.folowQuaterSphere(), App.HotpointSensor.recalculateDistance();
        }

        if (typeof this.iter == 'undefined')this.iter = 0;
        if (textVideo.length && this.iter++ % 5 == 0) {
            if (typeof this.iterat == 'undefined')this.iterat = 0;
            if (typeof this.direct == 'undefined')this.direct = 'top';
            if (typeof this.dimns == 'undefined')this.dimns = 1;
            this.dimns = this.iterat >= textVideo.length - 1 ? -1 : this.iterat > 0 ? 1 : -1;
            if (this.direct == 'top') {
                if (this.iterat >= textVideo.length - 1) {
                    this.dimns = -1;
                    this.direct = 'bot';
                } else {
                    this.dimns = 1;
                }

            } else {
                if (this.iterat <= 0) {
                    this.dimns = 1;
                    this.direct = 'top';
                } else {
                    this.dimns = -1;
                }
            }
            App.mainsphere.material.needUpdate = true;
            App.mainsphere.material.map = textVideo[this.iterat];
            this.iterat += this.dimns;
        }

        g.updateCubeMap(App.gl, App.scene)
    });
    App.AmbientSound = new Howl({
        urls: ["sound/ost_chapter_2_sphere_loop.mp3"],
        loop: !0,
        volume: .7
    });
    THREE.DefaultLoadingManager.onProgress = function (a, b, c) {
    };
    THREE.DefaultLoadingManager.onLoad = function () {
        a()
    }
    setTimeout(function () {
        //App.startApp();
        //App.AmbientSound.play();
        // $("#Preloader").fadeOut(3E3)
    }, 1);

});