import * as THREE from 'three';
import { WebVR } from './WebVR';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRM, VRMSchema } from '@pixiv/three-vrm';
import { Euler } from 'three';

window.addEventListener('DOMContentLoaded', () => {
  // scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1, 3);

  // renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.vr.enabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000);
  document.body.appendChild(renderer.domElement);

  // VR mode button
  // https://github.com/mrdoob/three.js/blob/e319f670f4e0230ffe277e790b2840110568cafa/examples/js/vr/WebVR.js
  document.body.appendChild(WebVR.createButton(renderer));

  // right
  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1).normalize();
  scene.add(light);

  // loader
  let currentVrm: VRM;
  const loader = new GLTFLoader();
  loader.load('./models/AliciaSolid.vrm', gltf => {
    VRM.from(gltf).then(vrm => {
      scene.add(vrm.scene);
      currentVrm = vrm;
      vrm.scene.rotation.y = Math.PI;
      vrm.scene.position.y -= 0.2;
      vrm.scene.position.z -= 1;
    });
  });

  // helpers
  // const gridHelper = new THREE.GridHelper(10, 10);
  // scene.add(gridHelper);
  // const axesHelper = new THREE.AxesHelper(5);
  // scene.add(axesHelper);

  // update
  const clock = new THREE.Clock();
  const update = (): void => {
    requestAnimationFrame(update);
    const deltaTime = clock.getDelta();
    const orientation = renderer.vr.getDevice()?.getPose().orientation;
    if (currentVrm && orientation) {
      const neck = currentVrm.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName.Neck);
      neck?.setRotationFromEuler(
        new Euler(orientation[0] * 2, orientation[1] * -2, orientation[2] * -2),
      );
      currentVrm.update(deltaTime);
    }
    renderer.render(scene, camera);
  };
  update();
});
