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
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders'; // Babylon.js 로더 확장 모듈
import './style.css'; // 스타일 시트 가져오기
import diffuseTexture from '../public/earth.jpg'; // 지구 텍스처
import emissiveTexture from '../public/night2.jpg'; // 야간 텍스처
import specularTexture from '../public/specular2.jpg'; // 반사 텍스처

import Chart from 'chart.js/auto'; // Chart.js 라이브러리

// DOMContentLoaded 이벤트 발생 시 실행
window.addEventListener('DOMContentLoaded', () => {
  // 8개의 Chart.js 차트를 생성하는 함수
  const charts: Chart[] = [];
  function createCharts() {
    const chartLabels = ['X축', 'Y축', 'Z축', '센서1', '센서2', '센서3', '센서4', '센서5'];
    const colors = ['red', 'green', 'blue', 'orange', 'purple', 'pink', 'cyan', 'yellow'];

    for (let i = 1; i <= 8; i++) {
      const canvas = document.getElementById(`chart${i}`) as HTMLCanvasElement;
      if (canvas) {
        const chart = new Chart(canvas, {
          type: 'line', // 라인 차트
          data: {
            labels: [], // X축 레이블 초기화
            datasets: [
              {
                label: chartLabels[i - 1], // 데이터셋 레이블
                data: [], // 초기 데이터
                borderColor: colors[i - 1], // 선 색상
                backgroundColor: colors[i - 1] + '20', // 배경 색상
                fill: false, // 채우기 비활성화
                tension: 0.1, // 곡선의 장력
              },
            ],
          },
          options: {
            responsive: false, // 반응형 비활성화
            maintainAspectRatio: false, // 비율 유지 비활성화
            scales: {
              x: { display: false }, // X축 숨김
              y: {
                beginAtZero: false, // Y축 0부터 시작 비활성화
                grid: { color: '#444' }, // 그리드 색상
                ticks: { color: 'white', font: { size: 10 } }, // 눈금 스타일
              },
            },
            plugins: {
              legend: {
                labels: { color: 'white', font: { size: 10 } }, // 범례 스타일
              },
            },
          },
        });
        charts.push(chart); // 생성된 차트를 배열에 추가
      }
    }
    (window as any).charts = charts; // window 객체에 차트 배열 등록
  }
  createCharts(); // 차트 생성 함수 호출

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

    // 위성 이동 및 회전 버튼 이벤트 설정
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
  });

  engine.runRenderLoop(() => {
    scene.render(); // Babylon.js 렌더 루프 실행
  });
});

// WebSocket 연결 설정
const ws = new WebSocket('ws://localhost:8080');
let prevX = 0,
  prevY = 0,
  prevZ = 0;
const ROTATE_THRESHOLD = 0.01; // 회전 오차 허용 최소값
const ROTATE_MAX = 10; // 회전 오차 허용 최대값

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

    for (let i = 0; i < Math.min(8, arr.length); i++) {
      const value = parseFloat(arr[i]);
      if (!isNaN(value) && charts[i]) {
        charts[i].data.labels.push(now);
        charts[i].data.datasets[0].data.push(value);

        if (charts[i].data.labels.length > 30) {
          charts[i].data.labels.shift();
          charts[i].data.datasets[0].data.shift();
        }
        charts[i].update('none');
      }
    }
  }
};
