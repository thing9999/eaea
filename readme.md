# 자세제어기

    - viwer (client typesciprt)
        차트,위성,지구 등을 화면에 보여주는 것들에대한 함수
    - serial (comport parser)
        시리얼 통신을하며 웹소켓으로 클라이언트에 데이터를 전송

# 폴더 구조

### apps/viwer

    - vite 로 패키징되어있으며 typescript 입니다
    - 실행명령
        npm run dev

    index.html
     레이어구조와 텍스트등 화면에 표기돼는 html 에대해 들어있습니다.

    src/main.ts
     레이어에서 동작하는 3d 렌더링과 좌표계산식등이 들어있습니다.
     자세한 설명은 주석으로되어있습니다.



    #### 주요 역할

    - Babylon.js를 이용한 3D 지구/위성 시각화 및 카메라 제어
    - Chart.js를 이용한 8개 센서 데이터 실시간 차트 표시
    - 웹소켓(`ws://localhost:8080`)을 통해 실시간 센서 데이터 수신 및 시각화
    - 위성 모델의 이동/회전 버튼 이벤트 처리
    - 차트 개별/전체 토글 기능 제공

    #### 주요 구성 및 동작

    - Babylon.js로 지구와 위성 3D 모델을 화면에 렌더링
    - Chart.js로 X, Y, Z, 센서1~5 총 8개 실시간 라인 차트 생성
    - 웹소켓 메시지 수신 시 위성의 회전값(X, Y, Z) 및 센서값을 차트에 실시간 반영
    - 각 차트는 최대 30개 데이터만 유지하며, 새 데이터가 들어오면 오래된 데이터는 삭제
    - `.toggle-btn` 버튼으로 각 차트의 표시/숨김 토글, `#toggle-all-charts`로 전체 토글 가능
    - 위성 이동/회전 버튼(`btn-up`, `btn-down` 등)으로 3D 모델 직접 제어 가능
    - 코드 내 모든 주요 동작은 한글 주석으로 상세 설명되어 있음


    #### 함수 및 이벤트 설명

    - **createCharts()**: 8개의 Chart.js 차트를 생성하고, 각 차트는 센서별로 실시간 데이터를 표시합니다. 생성된 차트 객체는 window.charts에 저장됩니다.
    - **setupToggleButtons()**: 각 차트의 `.toggle-btn` 버튼에 클릭 이벤트를 등록하여, 차트의 표시/숨김을 토글합니다.
    - **setupAllChartsToggle()**: `#toggle-all-charts` 버튼에 클릭 이벤트를 등록하여, 모든 차트의 표시/숨김을 한 번에 토글합니다.
    - **initializeToggleFunctions()**: 위의 토글 관련 함수들을 한 번에 실행합니다. 페이지 로드, 지연, 완전 로드 시 여러 번 호출되어 버튼 이벤트가 정상적으로 동작하도록 보장합니다.
    - **Babylon.js 3D 초기화**: Babylon.js의 Engine, Scene, Camera, Light, Earth(지구), Satellite(위성) 모델을 초기화하고, 위성 이동/회전 버튼(`btn-up`, `btn-down`, `btn-left`, `btn-right`, `btn-rotate-up`, `btn-rotate-down`, `btn-rotate-left`, `btn-rotate-right`, `btn-rotate-z-left`, `btn-rotate-z-right`)에 이벤트를 등록하여 3D 모델을 직접 제어할 수 있게 합니다.
    - **WebSocket 연결 및 onmessage 이벤트**: `ws://localhost:8080`에 연결하여, 센서 데이터가 도착할 때마다 위성의 회전값(X, Y, Z)을 적용하고, 8개 차트에 실시간으로 데이터를 추가합니다. 각 차트는 최대 30개 데이터만 유지합니다.

    ##### 주요 이벤트

    - **DOMContentLoaded**: 페이지가 준비되면 차트, 3D 씬, 버튼 이벤트 등 모든 초기화 작업을 수행합니다.
    - **load**: 모든 리소스가 완전히 로드된 후에도 버튼 이벤트를 재설정하여, 동적 생성된 요소의 이벤트 누락을 방지합니다.
    - **각종 버튼 클릭 이벤트**: 위성 이동/회전, 차트 토글 등 사용자 인터랙션을 처리합니다.
    - **WebSocket onmessage**: 실시간 데이터 수신 시 위성 회전 및 차트 갱신을 처리합니다.

### apps/serial

    - node 로 serial 라이브러리를 사용한 파서입니다.
    - 실행명령
        npm run dev

    index.js
     데이터를 파싱하여 웹소켓서버로 클라이언트에 전송합니다.
     - **SerialPort.list()**:
       시리얼 포트의 리스트를 를 보여줍니다
     - **port.on('error | open | data')**:
       시리얼 포트의 메세지를 처리합니다
     - **wss.on('connection','message','close')**:
       웹소켓 서버를 구성하고 메세지를 처리합니다.

    port.json
     포트 번호를 설정할수있습니다.
     예시

     소켓 서비스 포트 설정 8080
     시리얼 포트 설정 COM12
     가정했을시

     { "port": 8080, "com": "COM12" }
