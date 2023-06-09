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

let roomNumber = 0;
let userNumber = 1;
console.log('reload');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('connection');
    
     socket.onAny((e) => {
       console.log(`소켓이벤트: ${e}`);
     });

  // 답 확인 용
  socket.on('send', (msg) => {
    console.log(msg);
    const message = JSON.parse(msg);
    console.log(message.answer);
    console.log(message.value);
    if (message.answer === message.value) {
      const jsonMsg = { message: true };
      io.emit('send', JSON.stringify(jsonMsg));
    }
  });
  // 방 입장
  socket.on('insert_room', (msg) => {
    console.log(`msg::: ${JSON.stringify(msg)}`);
    // 초기값 0
    if (userNumber === 1) {
      //룸 증가시켜
      roomNumber = roomNumber + 1;
        socket.emit('insert_room', {
          roomNum: roomNumber, 
          pending: true,
          userNumber: userNumber,
          result: "success"
        });
      // 유저넘버 증가시켜
      userNumber = userNumber + 1; 
    } else if (userNumber === 2) {
         con.query(
           `SELECT answer FROM problem WHERE length = ? ORDER BY rand() LIMIT 1`,
           [msg.length],
           (err, result) => {
             if (err) {
               console.log(1);
               res.send('SQL 에러 발생');
             } else {
               if (result.length != 0) {
                 console.log(2);
                 socket.emit('insert_room', {
                   roomNum: roomNumber,
                   pending: false,
                   result : "success",
                   userNumber: userNumber,
                   value: result[0]['answer'],
                 });
               } else {
               }
             }
           }
         );
      userNumber = 1;
    }

      

    // console.log(`roomNumber ::: ${roomNumber} userNumber ::: ${userNumber}`);
    // 1씩증가
    
    console.log(roomNumber, userNumber);
    socket.join(`${roomNumber}`);
    // room number로 새로운 방 만들기

    console.log('socket.rooms: ', socket.rooms); //
  });

  // 답변받기
  socket.on('new_message', (msg) => { 
    console.log(msg.roomNum, msg.value);
    socket.emit('answer', msg.value);
    socket.to(msg.roomNum).emit('answer', msg.value);
  })
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
