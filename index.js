const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const onoff = require('onoff');
const i2c = require('i2c-bus');

var output22 = new onoff.Gpio(22+512, 'out');
var output17 = new onoff.Gpio(17+512, 'out');
var input16 = new onoff.Gpio(16+512, 'in', 'both');
var input18 = new onoff.Gpio(18+512, 'in', 'both');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/script.js');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
   console.log('user disconnected');
  });
});

io.on('connection', (socket) => {
  socket.on('temp', (msg) => {
    var temperature = Math.floor(Math.random() * 101);
    io.emit('temp', temperature);
    console.log(temperature);

    /* website
    const toCelsius = rawData => {
      rawData = (rawData >> 8) + ((rawData & 0xff) << 8);
      let celsius = (rawData & 0x0fff) / 16;
      if (rawData & 0x1000) {
        celsius -= 256;
      }
      return celsius;
    };

    i2c.openPromisified(1).
    then(i2c1 => i2c1.readWord(0x48, 0x00).
      then(rawData => console.log(toCelsius(rawData))).
      then(_ => i2c1.close())
    ).catch(console.log);
    */

    /* gewenst
    i2cbus.openPromisified(1).
      then(i2c1bus  => i2c1bus.readByte(0x48, 0x00).
        then(temperature => console.log(temperature)).
        then(temperature => io.emit('temp_value', temperature)).
        then(_ => i2c1bus.close())
      ).catch(console.log);
    */

    /* eerder
    async () => {
      try {
        let i2c1 = await i2cbus.openPromisified(1);
        let temperature = await i2c1.readByte(0x48, 0x00);
        console.log(temperature);
        io.emit('temp_value', temperature);
        await i2c1.close();
      }
      catch(error) {
        console.log(error);
      }
    }
    */
  });
  socket.on('chat message', (msg) => {
    if (msg == "get gpio 16") {
      var state16 = input16.readSync();
      io_emit(msg, state16);
    }
    else if (msg == "get gpio 18") {
      var state18 = input18.readSync();
      io_emit(msg, state18);
    }
    else if (msg == "set gpio 22 to 1") {
      output22.writeSync(1);
      io_emit(msg, 'GPIO 22 SET TO 1');
    }
    else if (msg == "set gpio 22 to 0") {
      output22.writeSync(0);
      io_emit(msg, 'GPIO 22 SET TO 0');
    }
    else if (msg == "set gpio 17 to 1") {
      output17.writeSync(1);
      io_emit(msg, 'GPIO 17 SET TO 1');
    }
    else if (msg == "set gpio 17 to 0") {
      output17.writeSync(0);
      io_emit(msg, 'GPIO 17 SET TO 0');
    }
    else {
      io.emit('chat message', msg);
    }
  });
});

function io_emit(ques, ans) {
  io.emit('chat message gpio ques', ques);
  io.emit('chat message gpio ans', ans);
}

server.listen(3000, () => {
  console.log('listening on *:3000');
});
