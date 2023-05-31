const express = require('express');
const app = express();

// html 파일 뿌려주기
app.use("/", (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// 8080포트 열고 서버 오픈
app.listen(8080);


const webSocket = require('ws');

// 웹소켓 열기
const socket = new webSocket.Server({
    port: 8081,
})

// 웹소켓 서버 연결 이벤트 바인드
socket.on('connection', (ws, req) => {
    
  // 데이터 수신 이벤트 바인드
  ws.on('message', (msg) => {
    console.log('유저가 보낸것 : ' + msg);
    // 웹소켓으로 서버 -> 유저 메세지 보내려면
    ws.send('꺼져');
  });

  ws.send(`Hello, ${req.socket.remoteAddress}`);
  // 연결 직후 해당 클라이언트로 데이터 전송
})