use std::io::{self, BufRead, Read};
use std::time::Duration;
use serialport;
use futures_util::{SinkExt, StreamExt};
use tokio::net::TcpListener;
use tokio_tungstenite::accept_async;
use tokio_tungstenite::tungstenite::Message;
use tokio::sync::broadcast;

#[tokio::main]
async fn main() {
    let port_name = "COM11";
    let baud_rate = 112500;
    let timeout = Duration::from_millis(1000);

    // broadcast 채널 생성 (메시지 버퍼 32개)
    let (tx, _rx) = broadcast::channel::<String>(32);

    // 시리얼 읽기: 블로킹 스레드에서 실행, 읽은 메시지를 broadcast 채널로 전송
    let port_name = port_name.to_string();
    let tx_serial = tx.clone();
    std::thread::spawn(move || {
        let port = serialport::new(&port_name, baud_rate)
            .timeout(timeout)
            .open();
        let mut port = match port {
            Ok(port) => port,
            Err(e) => {
                eprintln!("Failed to open port: {}", e);
                return;
            }
        };
        let mut reader = io::BufReader::new(port);
        let mut buf = vec![0u8; 1024];
        let mut line_buf = Vec::new();
        loop {
            match reader.read(&mut buf) {
                Ok(0) => break,
                Ok(n) => {
                    for &b in &buf[..n] {
                        if b == b'\n' {
                            // 줄 완성: 캐리지 리턴 제거 후 전송
                            let line = String::from_utf8_lossy(&line_buf).replace('\r', "");
                            println!("Received: {}", line);
                            let _ = tx_serial.send(line.clone());
                            line_buf.clear();
                        } else {
                            line_buf.push(b);
                        }
                    }
                }
                Err(e) => {
                    eprintln!("serial read error: {}", e);
                    std::thread::sleep(Duration::from_millis(500));
                }
            }
        }
        println!("Serial thread finished");
    });

    // 웹소켓 서버 열기
    let listener = TcpListener::bind("0.0.0.0:8080").await.expect("Failed to bind");
    println!("WebSocket server listening on ws://localhost:8080");

    // 클라이언트 접속 대기 및 처리
    while let Ok((stream, _)) = listener.accept().await {
        let ws_stream = accept_async(stream).await.expect("Failed to accept ws");
        println!("Client connected");
        let (mut ws_sink, _ws_stream) = ws_stream.split();
        let mut rx = tx.subscribe();

        tokio::spawn(async move {
            loop {
                match rx.recv().await {
                    Ok(msg) => {
                        if ws_sink.send(Message::Text(msg)).await.is_err() {
                            // 클라이언트와 연결 끊김
                            break;
                        }
                    }
                    Err(broadcast::error::RecvError::Lagged(_)) => {
                        // 메시지 손실 처리(무시하거나 로깅)
                    }
                    Err(broadcast::error::RecvError::Closed) => {
                        break; // 송신자 종료
                    }
                }
            }
            println!("Client disconnected");
        });
    }
}

