import { SerialPort } from 'serialport';
import { WebSocketServer } from 'ws';
import { readFileSync } from 'fs';
const data = JSON.parse(readFileSync('./port.json', 'utf8'));

// 카운트 필터
const splitCount = data.split;

console.log(data);
const wss = new WebSocketServer({ port: data.port });
console.log('WebSocket server started on ws://localhost:' + data.port);

SerialPort.list().then(
  (ports) => {
    console.log('===========================');
    ports.forEach((port) => {
      console.log(port.path + ' ' + port.manufacturer);
    });
    console.log('===========================');
  },
  (err) => {
    console.error('Error listing ports', err);
  }
);

// 시리얼 포트는 서버 시작 시 한 번만 열기
const port = new SerialPort({ path: data.com, baudRate: 115200 }); // 포트명과 속도는 환경에 맞게 변경

port.on('open', () => {
  console.log('Serial Port Opened');
});

port.on('data', (data) => {
  const msg = data.toString();
  // 시리얼데이터 받은 콘솔 출력

  // 연결된 모든 클라이언트에게 메시지 전송
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      message.split(data.cr).forEach((msg) => {
        if (msg.toString().split(' ').length === splitCount) {
          client.send(msg);
        }
      });
    }
  });
});

port.on('error', (err) => {
  console.error('SerialPort Error:', err.message);
});

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', (message) => {
    console.log(message.toString());

    // 갯수 세서 체크 해서 메세지 필터

    // websocket으로 받은 메시지를 시리얼 포트로 전송
    port.write(message, (err) => {
      if (err) {
        console.error('Error writing to serial:', err.message);
      } else {
        console.log('Sent to serial:', message.toString());
      }
    });
  });
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
