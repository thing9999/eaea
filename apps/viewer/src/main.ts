// Babylon.js 및 Chart.js 라이브러리에서 필요한 모듈을 가져옵니다.
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
import * as baby from '@babylonjs/core';

import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders'; // Babylon.js 로더 확장 모듈
import './style.css'; // 스타일 시트 가져오기
import diffuseTexture from '../public/earth.jpg'; // 지구 텍스처
import emissiveTexture from '../public/night2.jpg'; // 야간 텍스처
import specularTexture from '../public/specular2.jpg'; // 반사 텍스처

import Chart from 'chart.js/auto'; // Chart.js 라이브러리
(window as any).baby = baby;
let init = 0;
// DOMContentLoaded 이벤트 발생 시 실행
window.addEventListener('DOMContentLoaded', () => {
  // X, Y, Z / 센서1~3 / 센서4~6을 각각 한 차트에 묶어서 표시
  const charts: Chart[] = [];
  function createCharts() {
    // chart1: X, Y, Z
    const canvas1 = document.getElementById('chart1') as HTMLCanvasElement;
    if (canvas1) {
      const chart = new Chart(canvas1, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'X축',
              data: [],
              borderColor: 'red',
              backgroundColor: 'red20',
              fill: false,
              tension: 0.1,
            },
            {
              label: 'Y축',
              data: [],
              borderColor: 'green',
              backgroundColor: 'green20',
              fill: false,
              tension: 0.1,
            },
            {
              label: 'Z축',
              data: [],
              borderColor: 'blue',
              backgroundColor: 'blue20',
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
          plugins: { legend: { labels: { color: 'white', font: { size: 10 } } } },
        },
      });
      charts.push(chart);
    }
    // chart2: 센서1~3
    const canvas2 = document.getElementById('chart2') as HTMLCanvasElement;
    if (canvas2) {
      const chart = new Chart(canvas2, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: '센서1',
              data: [],
              borderColor: 'orange',
              backgroundColor: 'orange20',
              fill: false,
              tension: 0.1,
            },
            {
              label: '센서2',
              data: [],
              borderColor: 'purple',
              backgroundColor: 'purple20',
              fill: false,
              tension: 0.1,
            },
            {
              label: '센서3',
              data: [],
              borderColor: 'pink',
              backgroundColor: 'pink20',
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
          plugins: { legend: { labels: { color: 'white', font: { size: 10 } } } },
        },
      });
      charts.push(chart);
    }
    // chart3: 센서4~6
    const canvas3 = document.getElementById('chart3') as HTMLCanvasElement;
    if (canvas3) {
      const chart = new Chart(canvas3, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: '센서4',
              data: [],
              borderColor: 'cyan',
              backgroundColor: 'cyan20',
              fill: false,
              tension: 0.1,
            },
            {
              label: '센서5',
              data: [],
              borderColor: 'yellow',
              backgroundColor: 'yellow20',
              fill: false,
              tension: 0.1,
            },
            {
              label: '센서6',
              data: [],
              borderColor: 'gray',
              backgroundColor: 'gray20',
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
          plugins: { legend: { labels: { color: 'white', font: { size: 10 } } } },
        },
      });
      charts.push(chart);
    }
    (window as any).charts = charts;
  }
  createCharts();

  // 차트 토글 버튼 설정 함수
  function setupToggleButtons() {
    console.log('Setting up toggle buttons...');
    const toggleButtons = document.querySelectorAll('.toggle-btn'); // 모든 토글 버튼 선택
    console.log('Found toggle buttons:', toggleButtons.length);

    toggleButtons.forEach((button, index) => {
      console.log(`Setting up button ${index}:`, button);
      button.addEventListener('click', (e) => {
        e.preventDefault(); // 기본 동작 방지
        e.stopPropagation(); // 이벤트 전파 방지
        console.log('Toggle button clicked:', e.target);

        const target = e.target as HTMLElement;
        const container = target.closest('.chart-container'); // 버튼이 속한 컨테이너 찾기
        console.log('Found container:', container);

        if (container) {
          const wasCollapsed = container.classList.contains('collapsed'); // 접힘 상태 확인
          container.classList.toggle('collapsed'); // 접힘 상태 토글
          const isNowCollapsed = container.classList.contains('collapsed');

          target.textContent = isNowCollapsed ? '펼치기' : '접기'; // 버튼 텍스트 변경
          console.log(
            `Chart ${target.getAttribute('data-chart')}: ${wasCollapsed} -> ${isNowCollapsed}`
          );

          // 캔버스 표시 상태 변경
          const canvas = container.querySelector('canvas');
          if (canvas) {
            canvas.style.display = isNowCollapsed ? 'none' : 'block';
            console.log('Canvas display set to:', canvas.style.display);
          }
        }
      });
    });
  }

  // 전체 차트 토글 버튼 설정 함수
  function setupAllChartsToggle() {
    const toggleAllBtn = document.getElementById('toggle-all-charts'); // 전체 토글 버튼 선택
    console.log('Setting up all charts toggle button:', toggleAllBtn);

    if (toggleAllBtn) {
      let allCollapsed = false; // 전체 접힘 상태 초기화
      toggleAllBtn.addEventListener('click', () => {
        console.log('All charts toggle clicked, current state:', allCollapsed);

        const containers = document.querySelectorAll('.chart-container'); // 모든 차트 컨테이너 선택
        const toggleButtons = document.querySelectorAll('.toggle-btn'); // 모든 토글 버튼 선택
        const canvases = document.querySelectorAll('.chart-container canvas'); // 모든 캔버스 선택

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
        allCollapsed = !allCollapsed; // 상태 반전
        console.log(`모든 차트 ${allCollapsed ? '접힘' : '펼쳐짐'}`);
      });
    }
  }

  // 초기화 함수 호출
  function initializeToggleFunctions() {
    setupToggleButtons(); // 개별 버튼 설정
    setupAllChartsToggle(); // 전체 버튼 설정
  }

  initializeToggleFunctions(); // 즉시 실행
  setTimeout(initializeToggleFunctions, 500); // 지연 후 재실행
  window.addEventListener('load', initializeToggleFunctions); // 페이지 로드 후 실행

  // Babylon.js 기본 설정
  let satellite: any = null;
  (window as any).satellite = null;
  (window as any).z = function (cnt: number) {
    satellite.rotate(Axis.Z, (Math.PI / 360) * cnt, Space.LOCAL);
    console.log('Rotated Z by', (Math.PI / 360) * cnt);
  };

  (window as any).x = function (cnt: number) {
    satellite.rotate(Axis.X, (Math.PI / 360) * cnt, Space.LOCAL);
    console.log('Rotated X by', (Math.PI / 360) * cnt);
  };

  (window as any).y = function (cnt: number) {
    satellite.rotate(Axis.Y, (Math.PI / 360) * cnt, Space.LOCAL);
    console.log('Rotated Y by', (Math.PI / 360) * cnt);
  };

  const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
  if (!canvas) {
    throw new Error("Canvas element with id 'renderCanvas' not found.");
  }

  const engine = new Engine(canvas, true); // Babylon.js 엔진 생성
  const scene = new Scene(engine); // Babylon.js 씬 생성
  scene.clearColor = new Color4(0, 0, 0, 1); // 배경색 설정

  const orbitalCamera = new ArcRotateCamera(
    'orbitalCamera',
    Math.PI / 2,
    Math.PI / 3,
    400,
    Vector3.Zero(),
    scene
  );
  orbitalCamera.attachControl(canvas); // 카메라 제어 연결

  const depthRenderer = scene.enableDepthRenderer(orbitalCamera, false, true); // 깊이 렌더러 활성화

  const sun = new DirectionalLight('light', new Vector3(-5, -2, 0), scene); // 태양광 생성
  sun.position = sun.direction.negate(); // 태양 위치 설정

  const planetRadius = 1000e3; // 행성 반지름
  const atmosphereRadius = 6100e3; // 대기 반지름

  orbitalCamera.minZ = planetRadius / 100; // 카메라 최소 Z값
  orbitalCamera.maxZ = planetRadius * 100; // 카메라 최대 Z값
  orbitalCamera.radius = planetRadius * 4; // 카메라 반지름
  orbitalCamera.wheelPrecision = 100 / planetRadius; // 줌 민감도

  const earth = MeshBuilder.CreateSphere(
    'Earth',
    { segments: 32, diameter: planetRadius * 13 },
    scene
  );
  earth.rotation.x = Math.PI; // 지구 텍스처 회전
  earth.rotation.y = Math.PI / 2;
  earth.position = new Vector3(0, -planetRadius * 7, 0); // 지구 위치 설정
  const earthMaterial = new StandardMaterial('earthMaterial', scene);
  earthMaterial.diffuseTexture = new Texture(diffuseTexture, scene); // 확산 텍스처
  earthMaterial.emissiveTexture = new Texture(emissiveTexture, scene); // 방출 텍스처
  earthMaterial.specularTexture = new Texture(specularTexture, scene); // 반사 텍스처

  earth.material = earthMaterial; // 지구 재질 설정

  orbitalCamera.attachControl(canvas, true); // 카메라 제어 연결
  new HemisphericLight('light', new Vector3(1, 1, 0), scene); // 반구광 생성

  SceneLoader.ImportMesh('', '/satellite.glb', '', scene, (meshes) => {
    satellite = meshes[0];
    (window as any).satellite = satellite;
    const xx = 0.004;
    const moveStep = planetRadius * 0.05; // 이동 거리 설정
    if (meshes.length > 0) {
      meshes[0].position = Vector3.Zero(); // 위성 위치 초기화
      satellite.position = Vector3.Zero();
      satellite.scaling = new Vector3(planetRadius * xx, planetRadius * xx, planetRadius * xx); // 크기 설정
      orbitalCamera.setTarget(Vector3.Zero()); // 카메라 타겟 설정
    }

    document.getElementById('close-btn')?.addEventListener('click', () => {
      const pannel = document.getElementById('chart-panel');
      if (pannel) {
        if (pannel.style.display === 'none') {
          pannel.style.display = 'block';
        } else {
          pannel.style.display = 'none';
        }
      }
    });

    document.getElementById('open-pannel')?.addEventListener('click', () => {
      const pannel = document.getElementById('chart-panel');
      if (pannel) {
        pannel.style.display = 'block';
      }
    });

    // 위성 이동 및 회전 버튼 이벤트 설정
    document.getElementById('x-plus')?.addEventListener('click', () => {
      sendWSMessage('1');
    });
    document.getElementById('x-minus')?.addEventListener('click', () => {
      sendWSMessage('2');
    });
    document.getElementById('y-plus')?.addEventListener('click', () => {
      sendWSMessage('3');
    });
    document.getElementById('y-minus')?.addEventListener('click', () => {
      sendWSMessage('4');
    });
    document.getElementById('z-plus')?.addEventListener('click', () => {
      sendWSMessage('5');
    });
    document.getElementById('z-minus')?.addEventListener('click', () => {
      sendWSMessage('6');
    });

    document.getElementById('x-rplus')?.addEventListener('click', () => {
      sendWSMessage('7');
    });
    document.getElementById('x-rminus')?.addEventListener('click', () => {
      sendWSMessage('8');
    });
    document.getElementById('y-rplus')?.addEventListener('click', () => {
      sendWSMessage('9');
    });
    document.getElementById('y-rminus')?.addEventListener('click', () => {
      sendWSMessage('10');
    });
    document.getElementById('z-rplus')?.addEventListener('click', () => {
      sendWSMessage('11');
    });
    document.getElementById('z-rminus')?.addEventListener('click', () => {
      sendWSMessage('12');
    });

    document.getElementById('x-plus1')?.addEventListener('click', () => {
      if (satellite) {
        satellite.position.x += moveStep;
      }
    });
    document.getElementById('x-minus1')?.addEventListener('click', () => {
      if (satellite) {
        satellite.position.x -= moveStep;
      }
    });
    document.getElementById('y-plus1')?.addEventListener('click', () => {
      if (satellite) {
        satellite.position.y += moveStep;
      }
    });
    document.getElementById('y-minus1')?.addEventListener('click', () => {
      if (satellite) {
        satellite.position.y -= moveStep;
      }
    });
    document.getElementById('z-plus1')?.addEventListener('click', () => {
      if (satellite) {
        satellite.position.z += moveStep;
      }
    });
    document.getElementById('z-minus1')?.addEventListener('click', () => {
      if (satellite) {
        satellite.position.z -= moveStep;
      }
    });

    document.getElementById('init')?.addEventListener('click', () => {
      if (init === 0) {
        init = 1;
      }
    });
  });

  engine.runRenderLoop(() => {
    const ag = { x: 10, y: 0, z: 0 };
    scene.render(); // Babylon.js 렌더 루프 실행
    // 위성의 현재 위치와 각도 콘솔 출력 (null/undefined 및 NaN 방지)
    const satellite = (window as any).satellite;
    if (satellite && satellite.position && satellite.rotation) {
      const pos = satellite.position;
      const rot = satellite.rotationQuaternion;
      if (init === 1) {
        satellite.rotationQuaternion = baby.Quaternion.FromEulerAngles(Math.PI / ag.x, ag.y, ag.z);
        // satellite.rotate(Axis.X, 0, Space.LOCAL); // X축 회전

        // satellite.rotate(Axis.Y, (0.57 * Math.PI) / 180, Space.LOCAL);

        // satellite.rotate(Axis.Z, (-0.82 * Math.PI) / 180, Space.LOCAL);
        // init = 2;
      }

      const px = typeof pos.x === 'number' ? pos.x.toFixed(2) : 'N/A';
      const py = typeof pos.y === 'number' ? pos.y.toFixed(2) : 'N/A';
      const pz = typeof pos.z === 'number' ? pos.z.toFixed(2) : 'N/A';
      const rx = typeof rot.x === 'number' ? rot.x.toFixed(2) : 'N/A';
      const ry = typeof rot.y === 'number' ? rot.y.toFixed(2) : 'N/A';
      const rz = typeof rot.z === 'number' ? rot.z.toFixed(2) : 'N/A';
      console.log(`위치: x=${px}, y=${py}, z=${pz} | 각도: x=${rx}, y=${ry}, z=${rz}`);
    }
  });
});

// WebSocket 연결 설정
const ws = new WebSocket('ws://localhost:8080');

// 웹소켓으로 메시지 전송하는 함수
function sendWSMessage(msg: string) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(msg);
    console.log('WS 메시지 전송:', msg);
  } else {
    console.warn('WS 연결이 열려있지 않습니다.');
  }
}
(window as any).sendWSMessage = sendWSMessage; // window에 등록
let prevX = 0,
  prevY = 0,
  prevZ = 0;

// WebSocket 메시지 수신 처리
ws.onmessage = function (event) {
  let arr = event.data.split(' '); // 메시지를 공백으로 분리
  if (arr[0] === 'M') arr.shift(); // 첫 번째 요소가 'M'이면 제거
  const x = parseFloat(arr[0]);
  const y = parseFloat(arr[1]);
  const z = parseFloat(arr[2]);
  const satellite = (window as any).satellite;
  if (satellite && !isNaN(x) && !isNaN(y) && !isNaN(z)) {
    const dx = x - prevX;
    const dy = y - prevY;
    const dz = z - prevZ;

    satellite.rotate(Axis.X, dx / 64, Space.LOCAL); // X축 회전
    prevX = x;

    satellite.rotate(Axis.Y, dy / 64, Space.LOCAL); // Y축 회전
    prevY = y;

    satellite.rotate(Axis.Z, dz / 64, Space.LOCAL); // Z축 회전
    prevZ = z;

    console.log('위성 회전 적용(delta):', dx, dy, dz);
  } else {
    console.log('위성 적용 실패:', arr, x, y, z, satellite);
  }

  // 차트 데이터 업데이트
  const charts = (window as any).charts;
  if (charts && arr.length >= 8) {
    const now = new Date().toLocaleTimeString();
    // chart1: X, Y, Z
    const chart1 = charts[0];
    if (chart1) {
      chart1.data.labels.push(now);
      for (let i = 0; i < 3; i++) {
        const value = parseFloat(arr[i]);
        if (!isNaN(value)) {
          chart1.data.datasets[i].data.push(value);
          if (chart1.data.datasets[i].data.length > 30) {
            chart1.data.datasets[i].data.shift();
          }
        }
      }
      if (chart1.data.labels.length > 30) {
        chart1.data.labels.shift();
      }
      chart1.update('none');
    }
    // chart2: 센서1~3
    const chart2 = charts[1];
    if (chart2) {
      chart2.data.labels.push(now);
      for (let i = 0; i < 3; i++) {
        const value = parseFloat(arr[i + 3]); // arr[3], arr[4], arr[5]
        if (!isNaN(value)) {
          chart2.data.datasets[i].data.push(value);
          if (chart2.data.datasets[i].data.length > 30) {
            chart2.data.datasets[i].data.shift();
          }
        }
      }
      if (chart2.data.labels.length > 30) {
        chart2.data.labels.shift();
      }
      chart2.update('none');
    }
    // chart3: 센서4~6
    const chart3 = charts[2];
    if (chart3) {
      chart3.data.labels.push(now);
      for (let i = 0; i < 3; i++) {
        const value = parseFloat(arr[i + 6]); // arr[6], arr[7], arr[8]
        if (!isNaN(value)) {
          chart3.data.datasets[i].data.push(value);
          if (chart3.data.datasets[i].data.length > 30) {
            chart3.data.datasets[i].data.shift();
          }
        }
      }
      if (chart3.data.labels.length > 30) {
        chart3.data.labels.shift();
      }
      chart3.update('none');
    }
  }
};
