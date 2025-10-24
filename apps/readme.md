# 자세제어기

    - viwer (client typesciprt)
        차트,위성,지구 등을 화면에 보여주는 것들에대한 함수
    - serial (comport parser)
        시리얼 통신을하며 웹소켓으로 클라이언트에 데이터를 전송

## 세부내용

### viwer

    - vite 로 패키징되어있으며 typescript 입니다
    - 실행명령
        npm run dev

    index.html
     레이어구조와 텍스트등 화면에 표기돼는 html 에대해 들어있습니다.
     자세한 설명은 주석으로되어있습니다.
    src/main.ts
     레이어에서 동작하는 3d 렌더링과 좌표계산식등이 들어있습니다.
     자세한 설명은 주석으로되어있습니다.

### serial

    - node 로 serial 라이브러리를 사용한 파서입니다.
    - 실행명령
        npm run dev

    index.js
     데이터를 파싱하여 웹소켓서버로 클라이언트에 전송합니다.
