import {
  Axis,
  Space,
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  Vector3,
  Color4,
  DirectionalLight,
  Texture,
  StandardMaterial,
  MeshBuilder,
} from '@babylonjs/core';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders';
import './style.css';
import diffuseTexture from '../public/earth.jpg';
import emissiveTexture from '../public/night2.jpg';
import specularTexture from '../public/specular2.jpg';

import Chart from 'chart.js/auto';

// DOMContentLoaded 이후 실행
window.addEventListener('DOMContentLoaded', () => {
  // 1초마다 위성을 랜덤하게 x축으로 조금씩 움직임

  // Chart.js 차트 생성
  let chart: Chart | null = null;
  function createChart() {
    const canvas = document.getElementById('myChart') as HTMLCanvasElement;
    if (!canvas) return;
    chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: '실시간 데이터',
            data: [],
            borderColor: 'blue',
            fill: false,
          },
        ],
      },
    });
    (window as any).chart = chart; // window에 등록
  }
  createChart();

  // Babylon.js 기본 세팅
  let satellite: any = null;
  (window as any).satellite = null;

  const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
  if (!canvas) {
    throw new Error("Canvas element with id 'renderCanvas' not found.");
  }

  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0, 0, 0, 1);
  /**
   * start
   */

  const orbitalCamera = new ArcRotateCamera(
    'orbitalCamera',
    Math.PI / 2,
    Math.PI / 3,
    400,
    Vector3.Zero(),
    scene
  );
  orbitalCamera.attachControl(canvas);

  const depthRenderer = scene.enableDepthRenderer(orbitalCamera, false, true);

  const sun = new DirectionalLight('light', new Vector3(-5, -2, 0), scene);
  sun.position = sun.direction.negate();

  const planetRadius = 1000e3;
  const atmosphereRadius = 6100e3;

  orbitalCamera.minZ = planetRadius / 100;
  orbitalCamera.maxZ = planetRadius * 100;
  orbitalCamera.radius = planetRadius * 4;
  orbitalCamera.wheelPrecision = 100 / planetRadius;

  const earth = MeshBuilder.CreateSphere(
    'Earth',
    { segments: 32, diameter: planetRadius * 2 },
    scene
  );
  earth.rotation.x = Math.PI; // textures are always upside down on sphere for some reason...
  earth.rotation.y = Math.PI / 2;

  const earthMaterial = new StandardMaterial('earthMaterial', scene);
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
  new HemisphericLight('light', new Vector3(1, 1, 0), scene);

  SceneLoader.ImportMesh('', '/satellite.glb', '', scene, (meshes) => {
    satellite = meshes[0];
    (window as any).satellite = satellite;
    const xx = 0.004;
    const rotateStep = Math.PI / 4; // 회전할 각도 설정 (5도)
    const moveStep = planetRadius * 0.05; // 이동할 거리 설정 (지구 반지름의 5%)
    if (meshes.length > 0) {
      meshes[0].position = Vector3.Zero();
      satellite.position = new Vector3(planetRadius * 2.1, 1, 1); // 지구 중심에서 오른쪽으로 이동
      // satellite.setPivotPoint()
      satellite.scaling = new Vector3(planetRadius * xx, planetRadius * xx, planetRadius * xx); // 크기 확대
      orbitalCamera.setTarget(Vector3.Zero());
    }

    let t = 0;
    const orbitRadius = planetRadius * 2.1; // 궤도 반지름
    const orbitSpeed = 0.01; // 속도(라디안/프레임)

    setInterval(() => {
      t += orbitSpeed;
      if ((window as any).satellite) {
        const x = orbitRadius * Math.cos(t);
        const y = orbitRadius * Math.sin(t) * 0.2; // y축은 살짝만 변화(경사 궤도)
        const z = orbitRadius * Math.sin(t);
        (window as any).satellite.position.x = x;
        (window as any).satellite.position.y = y;
        (window as any).satellite.position.z = z;
      }
    }, 16); // 약 60fps

    document.getElementById('btn-up')?.addEventListener('click', () => {
      if (satellite) {
        satellite.position.y += moveStep;
      }
    });
    document.getElementById('btn-down')?.addEventListener('click', () => {
      if (satellite) {
        satellite.position.y -= moveStep;
      }
    });
    document.getElementById('btn-left')?.addEventListener('click', () => {
      if (satellite) {
        satellite.position.x -= moveStep;
      }
    });
    document.getElementById('btn-right')?.addEventListener('click', () => {
      if (satellite) {
        satellite.position.x += moveStep;
      }
    });

    document.getElementById('btn-rotate-up')?.addEventListener('click', () => {
      satellite.rotate(Axis.X, Math.PI / 64, Space.LOCAL);
    });

    document.getElementById('btn-rotate-down')?.addEventListener('click', () => {
      satellite.rotate(Axis.X, -Math.PI / 64, Space.LOCAL);
    });
    document.getElementById('btn-rotate-left')?.addEventListener('click', () => {
      satellite.rotate(Axis.Y, Math.PI / 64, Space.LOCAL);
    });
    document.getElementById('btn-rotate-right')?.addEventListener('click', () => {
      satellite.rotate(Axis.Y, -Math.PI / 64, Space.LOCAL);
    });

    //       document.getElementById("btn-rotate")?.addEventListener("click", () => {
    //   if (satellite) satellite.rotation.y += Math.PI / 18;
    // });
  });

  engine.runRenderLoop(() => {
    scene.render();
  });
});

async function connectBluetooth() {
  try {
    const device = await navigator.bluetooth.requestDevice({
      // filters: [{ services: ['battery_service'] }], // 원하는 서비스 UUID로 변경
      optionalServices: ['device_information'],
    });
    const server = await device.gatt?.connect();
    const service = await server?.getPrimaryService('your_service_uuid');
    const characteristic = await service?.getCharacteristic('your_characteristic_uuid');

    // 알림(Notify) 활성화
    await characteristic?.startNotifications();
    characteristic?.addEventListener('characteristicvaluechanged', (event: any) => {
      const value = event.target.value;
      // 예시: Uint8Array로 변환 후 출력
      const arr = new Uint8Array(value.buffer);
      console.log('블루투스 메시지:', arr);
      // 화면에 출력하려면 document.getElementById("output").innerText = arr.toString();
    });
    // 서비스/특성 접근 및 데이터 처리
    // 예: const service = await server.getPrimaryService('battery_service');
  } catch (error) {
    console.error('Bluetooth 연결 실패:', error);
  }
}

// 버튼 이벤트
document.getElementById('btn-bluetooth')?.addEventListener('click', connectBluetooth);

// WebSocket 연결
const ws = new WebSocket('ws://localhost:8080');
ws.onmessage = function (event) {
  // 메시지에서 숫자만 추출 (예: "value:123.45" 또는 "123.45")
  console.log(event.data.split(' '));
  const value = event.data.split(' ')[26];
  // const value = match ? parseFloat(match[0]) : NaN;
  const chart = (window as any).chart; // window에서 가져옴
  console.log('Received value:', value);
  if (!isNaN(value) && chart) {
    const now = new Date();
    chart.data.labels.push(now.toLocaleTimeString());
    chart.data.datasets[0].data.push(value);
    if (chart.data.labels.length > 30) {
      chart.data.labels.shift();
      chart.data.datasets[0].data.shift();
    }
    console.log(chart.data.datasets[0].data);
    // 배열 길이 맞추기

    chart.update();
  }
};
