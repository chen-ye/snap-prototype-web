// import * as THREE from 'three';
// require('three.xr.js');
// require('ar.js/three.js/build/ar.min.js');

/*global THREE*/
/*global THREEx*/
/*global TWEEN*/

class ThreeManager {
    initalizeThree = (container) => {
        this.canvas = this.createCanvas(document, container);

        this.scenes = {};
        this.activeShoe = null;
        this.t = undefined;
        this.renderer = new THREE.WebGLRenderer( { canvas: this.canvas, antialias: true } );
        this.renderer.setClearColor( 0xffffff, 1 );
        this.renderer.setPixelRatio( window.devicePixelRatio );

        // this.arToolkitSource = new THREEx.ArToolkitSource({
        //     // to read from the webcam 
        //     sourceType : 'webcam',	
        // });

        // this.arToolkitContext = new THREEx.ArToolkitContext({
        //     cameraParametersUrl: 'lib/camera_para.dat',
        //     detectionMode: 'mono',
        // });

        // this.arToolkitContext.init(() => {
        //     this.projectionMatrix = this.arToolkitContext.getProjectionMatrix();
        // })

        this.bindEventListeners();

        this.render();
        // this.arToolkitSource.init(this.resizeCanvas)
    }

    setShoeViewer = (shoeViewerElement) => {
        this.shoeViewerElement = shoeViewerElement;
    }

    createShoeScene = (container, shoeId, shoe) => {
        const scene = new THREE.Scene();
        scene.userData.container = container;

        const camera = new THREE.PerspectiveCamera( 45, 1, 1, 60 );
        camera.position.z = 18;
        scene.userData.camera = camera;

        scene.add( new THREE.HemisphereLight( 0xaaaaaa, 0x444444 ) );
        const light = new THREE.DirectionalLight( 0xffffff, 0.5 );
        light.position.set( 1, 1, 1 );
        scene.add( light );

        const lookGroup = new THREE.Group();
        scene.add(lookGroup);
        scene.userData.tiltControls = new THREE.DeviceOrientationControls(lookGroup);

        const orbitGroup = new THREE.Group();
        lookGroup.add(orbitGroup);

        const orbitControls = new THREE.OrbitControls( camera, document.getElementById('ShoeViewer') );
        orbitControls.minDistance = 6;
        orbitControls.maxDistance = 24;
        orbitControls.enablePan = false;
        orbitControls.enableZoom = true;
        orbitControls.target = orbitGroup.position;
        scene.userData.orbitControls = orbitControls;

        const loader = new THREE.OBJLoader2();
        loader.loadMtl(
            shoe.geometry.mtl,
            null,
            (materials) => {
                loader.setMaterials(materials);
                loader.load(
                    shoe.geometry.obj,
                    (event) => {
                        const object = event.detail.loaderRootNode;        
                        object.rotateY(Math.PI/2);
                        object.translateY(-2.5);
                        orbitGroup.add(object);

                        this.scenes[shoeId] = scene;
                    }
                )
            }
        )

    }

    setActiveShoe = (shoeId) => {
        this.t = shoeId ? 0 : 1;
        const tEnd = {
            t: shoeId ? 1 : 0
        };
        const tween = new TWEEN.Tween(this).to(tEnd, 500);
        tween.easing(TWEEN.Easing.Exponential.InOut)
        
        if(shoeId) {
            this.activeShoe = shoeId;
        } else {
            tween.onComplete(() => {
                this.activeShoe = shoeId;
                this.t = undefined;
            })
        }

        tween.start();
    }

    createCanvas = (document, container) => {
        const canvas = document.createElement('canvas');     
        container.appendChild(canvas);
        return canvas;
    }

    resizeCanvas = () => {
        this.canvas.style.width = '100%';
        this.canvas.style.height= '100%';
        
        this.canvas.width  = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        this.renderer.setSize( this.canvas.width, this.canvas.height, false );

        // if( this.arToolkitSource.ready ) {
        //     this.arToolkitSource.onResizeElement();
        //     if( this.arToolkitContext.arController !== null ){
        //         this.arToolkitSource.copySizeTo(this.arToolkitContext.arController.canvas)	
        //     }	
        // }
    }

    bindEventListeners = () => {
        window.onresize = this.resizeCanvas;
        window.onmousemove = this.mouseMove;
        this.resizeCanvas();	
    }

    mouseMove = ({screenX, screenY}) => {
        // sceneManager.onMouseMove(screenX-canvasHalfWidth, screenY-canvasHalfHeight);
    }

    render = (time) => {
        // if( this.arToolkitSource.ready ) {
        //     this.arToolkitContext.update( this.arToolkitSource.domElement )
        // }

        this.renderer.setClearColor( 0xffffff );
        this.renderer.setScissorTest( false );
        this.renderer.clear();
        this.renderer.setClearColor( 0xe0e0e0 );
        this.renderer.setScissorTest( true );
        TWEEN.update();

        if (this.t !== 1) {
            Object.keys(this.scenes).forEach(shoeId => {
                const scene = this.scenes[shoeId];
                // scene.children[ 0 ].rotation.y = Date.now() * 0.001;
    
                const rect = scene.userData.container.getBoundingClientRect();
    
                // check if it's offscreen. If so skip it
                if ( rect.bottom < 0 || rect.top  > this.renderer.domElement.clientHeight ||
                    rect.right  < 0 || rect.left > this.renderer.domElement.clientWidth ) {
                    return;  // it's off screen
                }
    
                scene.userData.tiltControls.update();
    
                const width  = rect.right - rect.left;
                const height = rect.bottom - rect.top;
                const left   = rect.left;
                const top    = rect.top;
    
                const aspect = width / height;
    
                const camera = scene.userData.camera;
                if (camera.aspect !== aspect) {
                    camera.aspect = aspect;
                    camera.updateProjectionMatrix();
                }
    
                this.renderer.setViewport( left, top, width, height );
                this.renderer.setScissor( left, top, width, height );
                
                this.renderer.render(scene, scene.userData.camera);
            })
        }

        if (this.t !== undefined) {
            const scene = this.scenes[this.activeShoe];

            const rect = scene.userData.container.getBoundingClientRect();
            const rWidth  = rect.right - rect.left;
            const rHeight = rect.bottom - rect.top;
            const rLeft   = rect.left;
            const rTop    = rect.top;

            const viewerRect = this.shoeViewerElement.getBoundingClientRect();
            const vWidth  = viewerRect.right - viewerRect.left;
            const vHeight = viewerRect.bottom - viewerRect.top;
            const vLeft   = viewerRect.left;
            const vTop    = viewerRect.top;

            const width = THREE.Math.lerp(rWidth, vWidth, this.t)
            const height = THREE.Math.lerp(rHeight, vHeight, this.t)
            const left = THREE.Math.lerp(rLeft, vLeft, this.t)
            const top = THREE.Math.lerp(rTop, vTop, this.t)

            const aspect = width / height;

            scene.userData.tiltControls.update();

            const camera = scene.userData.camera;
            if (camera.aspect !== aspect) {
                camera.aspect = aspect;
                camera.updateProjectionMatrix();
            }
            this.renderer.setViewport( left, top, width, height );
            this.renderer.setScissor( left, top, width, height );
            
            this.renderer.render(scene, scene.userData.camera);
        }

        this.prevFrame = time;
        requestAnimationFrame(this.render);
    }
}

export default new ThreeManager();