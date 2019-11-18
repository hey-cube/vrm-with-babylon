import * as THREE from 'three';
import { WebVR } from './WebVR';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRM, VRMSchema } from '@pixiv/three-vrm';

window.addEventListener('DOMContentLoaded', () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1, 3);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.vr.enabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000);
  document.body.appendChild(renderer.domElement);

  // https://github.com/mrdoob/three.js/blob/e319f670f4e0230ffe277e790b2840110568cafa/examples/js/vr/WebVR.js
  document.body.appendChild(WebVR.createButton(renderer));

  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1).normalize();
  scene.add(light);

  const loader = new GLTFLoader();
  loader.load('./models/AliciaSolid.vrm', gltf => {
    VRM.from(gltf).then(vrm => {
      scene.add(vrm.scene);
      vrm.scene.rotation.y = Math.PI;
      vrm.scene.position.y -= 0.2;
      vrm.scene.position.z -= 1;

      if (vrm.humanoid === undefined) {
        return;
      }
      vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.LeftUpperArm)!.rotation.x = 0.6;
      vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.LeftLowerArm)!.rotation.x = 0.8;
      vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.LeftLowerArm)!.rotation.y = -1;
      vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.LeftHand)!.rotation.y = -0.5;
      vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.RightUpperArm)!.rotation.z = -1.3;

      if (vrm.blendShapeProxy === undefined) {
        return;
      }
      vrm.blendShapeProxy.setValue(VRMSchema.BlendShapePresetName.Fun, 0.7);
      vrm.blendShapeProxy.setValue(VRMSchema.BlendShapePresetName.Sorrow, 0.2);
      vrm.blendShapeProxy.update();
    });
  });

  const update = (): void => {
    renderer.render(scene, camera);
    requestAnimationFrame(update);
  };
  update();
});
