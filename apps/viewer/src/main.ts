import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, Color4, DirectionalLight, Texture, StandardMaterial, MeshBuilder } from "@babylonjs/core";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import "@babylonjs/loaders";
import "./style.css";
import diffuseTexture from "../public/earth.jpg";
import emissiveTexture from "../public/night2.jpg";
import specularTexture from "../public/specular2.jpg";


// DOMContentLoaded 이후 실행
window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
  if (!canvas) {
    throw new Error("Canvas element with id 'renderCanvas' not found.");
  }

  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0, 0, 0, 1);
/**
 * start
 */

  const orbitalCamera = new ArcRotateCamera("orbitalCamera", Math.PI / 2, Math.PI / 3, 400, Vector3.Zero(), scene);
  orbitalCamera.attachControl(canvas);

  const depthRenderer = scene.enableDepthRenderer(orbitalCamera, false, true);

  const sun = new DirectionalLight("light", new Vector3(-5, -2, 0), scene);
  sun.position = sun.direction.negate();

  const planetRadius = 1000e3;
  const atmosphereRadius = 6100e3;

  orbitalCamera.minZ = planetRadius / 100;
  orbitalCamera.maxZ = planetRadius * 100;
  orbitalCamera.radius = planetRadius * 4;
  orbitalCamera.wheelPrecision = 100 / planetRadius;

  const earth = MeshBuilder.CreateSphere("Earth", { segments: 32, diameter: planetRadius * 2 }, scene);
  earth.rotation.x = Math.PI; // textures are always upside down on sphere for some reason...
  earth.rotation.y = Math.PI / 2;

  const earthMaterial = new StandardMaterial("earthMaterial", scene);
  earthMaterial.diffuseTexture = new Texture(diffuseTexture, scene);
  earthMaterial.emissiveTexture = new Texture(emissiveTexture, scene);
  earthMaterial.specularTexture = new Texture(specularTexture, scene);

  earth.material = earthMaterial;

  /**
   * end
   */
  // const camera = new ArcRotateCamera(
  //   "camera",
  //   Math.PI / 2,
  //   Math.PI / 2.5,
  //   5000, // 반지름(거리) 값을 10 → 20 등으로 늘려보세요
  //   Vector3.Zero(),
  //   scene
  // );
  orbitalCamera.attachControl(canvas, true);
  new HemisphericLight("light", new Vector3(1, 1, 0), scene);

  SceneLoader.ImportMesh(
    "",
    "/satellite.glb",
    "",
    scene,
    (meshes) => {
      const xx = 0.004
      if (meshes.length > 0) {
        const satellite = meshes[0];
        meshes[0].position = Vector3.Zero();
        satellite.position = new Vector3(planetRadius * 2.1, 1, 1); // 지구 중심에서 오른쪽으로 이동
        satellite.scaling = new Vector3(planetRadius * xx, planetRadius * xx, planetRadius * xx); // 크기 확대
        orbitalCamera.setTarget(Vector3.Zero());
      }
    }
  );

  engine.runRenderLoop(() => {
    scene.render();
  });
});

