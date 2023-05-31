const express = require('express');
const app = express();

// index 파일 뿌려주기
app.use('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
// 8000번 포트 사용
app.listen(8000, () => {
  console.log(`Example app listening on port 8000`);
});

const { WebSocketServer } = require('ws');
// 웹소켓 서버 생성

const wss = new WebSocketServer({ port: 8001 })

 // broadcast 메소드 추가
  wss.broadcast = (message) => {
    wss.clients.forEach((client) => {
      client.send(message);
    });
  };

// 웹소켓 서버 연결 이벤트 바인드
wss.on('connection', (ws, request) => {
  // request: 클라이언트로 부터 전송된 http GET 리퀘스트 정보
  //  ws 는 연결된 클라이언트
  
    //모든 클라이언트에 메세지를 보내는 것을 브로드캐스트 (Broadcast) 한다고 말한다.
  wss.broadcast(`새로운 유저가 접속했습니다. 현재 유저 ${wss.clients.size} 명`);

  console.log(`새로운 유저 접속: ${request.socket.remoteAddress}`);
  // 데이터 수신 이벤트 바인드
  ws.on('message', (data) => {
      //  현재 클라이언트에서 전송되는 데이터를 서버에서 Blob으로 수신하므로 toString() 메소드로 String 으로 만들 필요가 있다.
    wss.broadcast(data.toString());
  });
  // 유저 연결 끊김 이벤트
  ws.on('close', () => {
     wss.broadcast(`유저 한명이 떠났습니다. 현재 유저 ${wss.clients.size} 명`);
  });
  ws.send(`Hello, ${request.socket.remoteAddress}`);
  // 연결 직후 해당 클라이언트로 데이터 전송
});