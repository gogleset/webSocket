const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 80;
const cors = require('cors');
const mysql = require('mysql2');
const con = mysql.createConnection({
  host: '34.64.147.159',
  port: 3306,
  user: 'anydevil',
  password: 'wordle',
  database: 'wordle',
});

app.use(cors());

// 채팅방( 계속 증가되는 수로 만듬)
let roomNumber = 0;
// 채팅방 들어온 사람 수 카운터
let userNumber = 1;
// 채팅방에 1명만 들어오면 기다려야 하니 pending으로 클라이언트 통신
let pending = true;
// 답 관리 {룸이름: 답이름}
let answer = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('connection');
  socket.onAny((e) => {
    console.log(`소켓이벤트: ${e}`);
  });

  //1. 방 입장
  socket.on('insert_room', (msg) => {
    let value;
    console.log(`msg::: ${JSON.stringify(msg)}`);
    //1-1. 초기값 0
    if (userNumber === 1) {
      //룸번호 증가시키기
      roomNumber = roomNumber + 1;
      socket.emit('insert_room', {
        roomNum: roomNumber,
        userNumber: userNumber,
        result: 'success',
      });
      //1-2. 대기 현황 업데이트
      pending = true;
      //1-3. 유저넘버 증가시키기
      userNumber = userNumber + 1;
    } else if (userNumber === 2) {
      //    con.query(
      //      `SELECT answer FROM problem WHERE length = ? ORDER BY rand() LIMIT 1`,
      //      [msg.length],
      //      (err, result) => {
      //        if (err) {
      //          res.send('SQL 에러 발생');
      //        } else {
      //          if (result.length != 0) {
      //            socket.emit('insert_room', {
      //              roomNum: roomNumber,
      //              pending: false,
      //              result: 'success',
      //              userNumber: userNumber,
      //              value: result[0]['answer'],
      //            });
      //          } else {
      //          }
      //        }
      //      }
      // );
      socket.emit('insert_room', {
        roomNum: roomNumber,
        userNumber: userNumber,
        result: 'success',
      });
      // 답 정해서 값 넣어주기
      answer[`${roomNumber}`] = 'react';
      console.log(answer);
      // pending값 바꿔주기
      pending = false;
      userNumber = 1;
    }

    console.log(roomNumber, userNumber);
    // 1-4. 방에 참가시키기
    socket.join(`${roomNumber}`);

    //2. 방이 꽉차면
    if (!pending) {
      // 방에 있는 사람들한테 꽉찼다고 보냄
      io.to(String(roomNumber)).emit('pending', {
        result: 'success',
        pending: pending,
      });
    }
    console.log('socket.rooms: ', socket.rooms); //
  });

  //3. 턴 관리
  socket.on('turn', (msg) => {
    console.log(msg);
    let turn;
    if (msg.userNum === 1) {
      turn = 2;
    } else {
      turn = 1;
    }
    console.log(turn);
    io.to(msg.roomNum).emit('turn', { userTurn: turn, result: 'success' });
  }); 

  //4. 답변받기
  socket.on('answer', (msg) => {
    console.log(msg);
    console.log(answer[msg.roomNum]);
    // 룸 방에 있는 정답 값과 유저가 입력한 값이 같을때(서버에 저장되어 있는 값이랑 같을 때)
    if (answer[msg.roomNum] === msg.value) {
      io.to(msg.roomNum).emit('answer', {
        result: 'success',
        gameWin: true,
        userNum: msg.userNum,
      });  
    } else {
        io.to(msg.roomNum).emit('answer', {
          result: 'success',
          gameWin: false,
          userNum: msg.userNum,
        });  
    }

    // 클라이언트에서 보내는 유저넘버랑 서버에서 관리하는 턴이랑 같을때
    
  });
  //5. 채팅방 나가기
  socket.on('leaveRoom', (roomNumber) => {
    // console.log(roomNumber);
    io.socketsLeave(roomNumber);
    console.log('socket.rooms: ', socket.rooms); //
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
