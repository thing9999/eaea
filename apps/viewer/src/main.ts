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

  // 8개 Chart.js 차트 생성
  const charts: Chart[] = [];
  function createCharts() {
    const chartLabels = ['X축', 'Y축', 'Z축', '센서1', '센서2', '센서3', '센서4', '센서5'];
    const colors = ['red', 'green', 'blue', 'orange', 'purple', 'pink', 'cyan', 'yellow'];

    for (let i = 1; i <= 8; i++) {
      const canvas = document.getElementById(`chart${i}`) as HTMLCanvasElement;
      if (canvas) {
        const chart = new Chart(canvas, {
          type: 'line',
          data: {
            labels: [],
            datasets: [
              {
                label: chartLabels[i - 1],
                data: [],
                borderColor: colors[i - 1],
                backgroundColor: colors[i - 1] + '20',
                fill: false,
                tension: 0.1,
              },
            ],
          },
          options: {
            responsive: false,
            maintainAspectRatio: false,
            scales: {
              x: { display: false },
              y: {
                beginAtZero: false,
                grid: { color: '#444' },
                ticks: { color: 'white', font: { size: 10 } },
              },
            },
            plugins: {
              legend: {
                labels: { color: 'white', font: { size: 10 } },
              },
            },
          },
        });
        charts.push(chart);
      }
    }
    (window as any).charts = charts; // window에 등록
  }
  createCharts();

  // 차트 토글 기능 - 더 안정적인 이벤트 처리
  function setupToggleButtons() {
    console.log('Setting up toggle buttons...');
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    console.log('Found toggle buttons:', toggleButtons.length);

    toggleButtons.forEach((button, index) => {
      console.log(`Setting up button ${index}:`, button);
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Toggle button clicked:', e.target);

        const target = e.target as HTMLElement;
        const container = target.closest('.chart-container');
        console.log('Found container:', container);

        if (container) {
          const wasCollapsed = container.classList.contains('collapsed');
          container.classList.toggle('collapsed');
          const isNowCollapsed = container.classList.contains('collapsed');

          target.textContent = isNowCollapsed ? '펼치기' : '접기';
          console.log(
            `Chart ${target.getAttribute('data-chart')}: ${wasCollapsed} -> ${isNowCollapsed}`
          );

          // 캔버스 직접 제어로 확실하게 처리
          const canvas = container.querySelector('canvas');
          if (canvas) {
            canvas.style.display = isNowCollapsed ? 'none' : 'block';
            console.log('Canvas display set to:', canvas.style.display);
          }
        }
      });
    });
  }

  // 전체 차트 토글 기능
  function setupAllChartsToggle() {
    const toggleAllBtn = document.getElementById('toggle-all-charts');
    console.log('Setting up all charts toggle button:', toggleAllBtn);

    if (toggleAllBtn) {
      let allCollapsed = false;
      toggleAllBtn.addEventListener('click', () => {
        console.log('All charts toggle clicked, current state:', allCollapsed);

        const containers = document.querySelectorAll('.chart-container');
        const toggleButtons = document.querySelectorAll('.toggle-btn');
        const canvases = document.querySelectorAll('.chart-container canvas');

        if (allCollapsed) {
          // 전체 펼치기
          containers.forEach((container) => container.classList.remove('collapsed'));
          toggleButtons.forEach((btn) => (btn.textContent = '접기'));
          canvases.forEach((canvas) => ((canvas as HTMLElement).style.display = 'block'));
          toggleAllBtn.textContent = '전체 접기';
        } else {
          // 전체 접기
          containers.forEach((container) => container.classList.add('collapsed'));
          toggleButtons.forEach((btn) => (btn.textContent = '펼치기'));
          canvases.forEach((canvas) => ((canvas as HTMLElement).style.display = 'none'));
          toggleAllBtn.textContent = '전체 펼치기';
        }
        allCollapsed = !allCollapsed;
        console.log(`모든 차트 ${allCollapsed ? '접힘' : '펼쳐짐'}`);
      });
    }
  }

  // DOM 완전 로드 후 버튼 이벤트 설정 - 여러 번 시도
  function initializeToggleFunctions() {
    setupToggleButtons();
    setupAllChartsToggle();
  }

  // 즉시 한 번 실행
  initializeToggleFunctions();

  // 지연 후 다시 실행 (차트 생성 완료 후)
  setTimeout(initializeToggleFunctions, 500);

  // 페이지 완전 로드 후에도 한 번 더
  window.addEventListener('load', initializeToggleFunctions);

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
    // const rotateStep = Math.PI / 4; // 회전할 각도 설정 (5도)
    const moveStep = planetRadius * 0.05; // 이동할 거리 설정 (지구 반지름의 5%)
    if (meshes.length > 0) {
      meshes[0].position = Vector3.Zero(); // 위성을 중심으로 위치 조정
      satellite.position = Vector3.Zero(); // 위성을 정중앙에 배치
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
    document.getElementById('btn-rotate-z-left')?.addEventListener('click', () => {
      satellite.rotate(Axis.Z, Math.PI / 64, Space.LOCAL);
    });
    document.getElementById('btn-rotate-z-right')?.addEventListener('click', () => {
      satellite.rotate(Axis.Z, -Math.PI / 64, Space.LOCAL);
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
  // try {
  //   const device = await navigator.bluetooth.requestDevice({
  //     // filters: [{ services: ['battery_service'] }], // 원하는 서비스 UUID로 변경
  //     optionalServices: ['device_information'],
  //   });
  //   const server = await device.gatt?.connect();
  //   const service = await server?.getPrimaryService('your_service_uuid');
  //   const characteristic = await service?.getCharacteristic('your_characteristic_uuid');
  //   // 알림(Notify) 활성화
  //   await characteristic?.startNotifications();
  //   characteristic?.addEventListener('characteristicvaluechanged', (event: any) => {
  //     const value = event.target.value;
  //     // 예시: Uint8Array로 변환 후 출력
  //     const arr = new Uint8Array(value.buffer);
  //     console.log('블루투스 메시지:', arr);
  //     // 화면에 출력하려면 document.getElementById("output").innerText = arr.toString();
  //   });
  //   // 서비스/특성 접근 및 데이터 처리
  //   // 예: const service = await server.getPrimaryService('battery_service');
  // } catch (error) {
  //   console.error('Bluetooth 연결 실패:', error);
  // }
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

  // 8개 차트에 데이터 업데이트
  const charts = (window as any).charts;
  if (charts && arr.length >= 8) {
    const now = new Date().toLocaleTimeString();

    // 각 차트에 해당하는 데이터 추가
    for (let i = 0; i < Math.min(8, arr.length); i++) {
      const value = parseFloat(arr[i]);
      if (!isNaN(value) && charts[i]) {
        charts[i].data.labels.push(now);
        charts[i].data.datasets[0].data.push(value);

        // 최대 30개 데이터만 유지
        if (charts[i].data.labels.length > 30) {
          charts[i].data.labels.shift();
          charts[i].data.datasets[0].data.shift();
        }
        charts[i].update('none'); // 애니메이션 없이 업데이트
      }
    }
  }
};
