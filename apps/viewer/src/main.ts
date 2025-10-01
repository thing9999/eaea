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
  // roll(X), pitch(Y), yaw(Z) 값으로 위성 회전 제어 함수
  function moveSatelliteByRPY(roll: number, pitch: number, yaw: number) {
    if ((window as any).satellite) {
      const sat = (window as any).satellite;
      sat.rotation.x = roll;
      sat.rotation.y = pitch;
      sat.rotation.z = yaw;
    }
  }
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
    { segments: 32, diameter: planetRadius * 13 },
    scene
  );
  earth.rotation.x = Math.PI; // textures are always upside down on sphere for some reason...
  earth.rotation.y = Math.PI / 2;
  earth.position = new Vector3(0, -planetRadius * 7, 0);
  const earthMaterial = new StandardMaterial('earthMaterial', scene);
  earthMaterial.diffuseTexture = new Texture(diffuseTexture, scene);
  earthMaterial.emissiveTexture = new Texture(emissiveTexture, scene);
  earthMaterial.specularTexture = new Texture(specularTexture, scene);

  earth.material = earthMaterial;

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

    // let t = 0;
    // const orbitRadius = planetRadius * 2.1; // 궤도 반지름
    // const orbitSpeed = 0.01; // 속도(라디안/프레임)

    // setInterval(() => {
    //   t += orbitSpeed;
    //   if ((window as any).satellite) {
    //     const x = orbitRadius * Math.cos(t);
    //     const y = orbitRadius * Math.sin(t) * 0.2; // y축은 살짝만 변화(경사 궤도)
    //     const z = orbitRadius * Math.sin(t);
    //     (window as any).satellite.position.x = x;
    //     (window as any).satellite.position.y = y;
    //     (window as any).satellite.position.z = z;
    //   }
    // }, 16); // 약 60fps

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
// 이전 회전값 저장용 변수
let prevX = 0,
  prevY = 0,
  prevZ = 0;
const ROTATE_THRESHOLD = 0.01; // 오차 허용 최소값 (라디안)
const ROTATE_MAX = 10; // 오차 허용 최대값
ws.onmessage = function (event) {
  // 메시지를 공백으로 split
  let arr = event.data.split(' ');
  // 첫 배열의 'M' 제거
  if (arr[0] === 'M') arr.shift();
  // x, y, z 값 추출 및 적용
  const x = parseFloat(arr[0]);
  const y = parseFloat(arr[1]);
  const z = parseFloat(arr[2]);
  const satellite = (window as any).satellite;
  if (satellite && !isNaN(x) && !isNaN(y) && !isNaN(z)) {
    // 이전 값과의 차이만큼만 회전 적용 (오차 범위 내 변화는 무시)
    const dx = x - prevX;
    const dy = y - prevY;
    const dz = z - prevZ;
    if (Math.abs(dx) > ROTATE_THRESHOLD && Math.abs(dx) < ROTATE_MAX) {
      satellite.rotate(Axis.X, dx / 64, Space.LOCAL);
      prevX = x;
    }
    if (Math.abs(dy) > ROTATE_THRESHOLD && Math.abs(dy) < ROTATE_MAX) {
      satellite.rotate(Axis.Y, dy / 64, Space.LOCAL);
      prevY = y;
    }
    if (Math.abs(dz) > ROTATE_THRESHOLD && Math.abs(dz) < ROTATE_MAX) {
      satellite.rotate(Axis.Z, dz / 64, Space.LOCAL);
      prevZ = z;
    }
    console.log('위성 회전 적용(delta):', dx, dy, dz);
  } else {
    console.log('위성 적용 실패:', arr, x, y, z, satellite);
  }

  // 기존 차트 로직 유지 (원하면 제거 가능)
  const chart = (window as any).chart;
  if (!isNaN(x) && chart) {
    const now = new Date();
    chart.data.labels.push(now.toLocaleTimeString());
    chart.data.datasets[0].data.push(x);
    if (chart.data.labels.length > 30) {
      chart.data.labels.shift();
      chart.data.datasets[0].data.shift();
    }
    chart.update();
  }
};
