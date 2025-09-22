import { WebSocket } from 'ws';

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
  console.log('Connected to server');
  
});

ws.on('message', (message) => {
  console.log('Received:', message.toString());
});

ws.on('close', () => {
  console.log('Disconnected from server');
});