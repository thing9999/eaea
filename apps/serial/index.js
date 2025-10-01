import { SerialPort } from 'serialport';
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
console.log('WebSocket server started on ws://localhost:8080');

// 시리얼 포트는 서버 시작 시 한 번만 열기
const port = new SerialPort({ path: 'COM11', baudRate: 115200 }); // 포트명과 속도는 환경에 맞게 변경

port.on('open', () => {
  console.log('Serial Port Opened');
});

port.on('data', (data) => {
  const msg = data.toString();
  console.log('Received from Serial:', msg.toString());
  // 연결된 모든 클라이언트에게 메시지 전송
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      // WebSocket.OPEN
      client.send(msg);
    }
  });
});

port.on('error', (err) => {
  console.error('SerialPort Error:', err.message);
});

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', (message) => {
    console.log('Received from client:', message.toString());
    ws.send('Echo: ' + message);
  });
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
