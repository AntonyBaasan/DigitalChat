var io = require('socket.io')({
    transports: ['websocket'],
});

io.attach(4567);

/*
io.on('connection', function(socket){
    console.log("Someone connected...");

    socket.on('beep', function(data){
        console.log("beep was called. data: "+data['email']+", "+data['pass']);
  //      socket.emit('boop');

    });

    socket.on('test', function(){
        console.log("test was called");
        //      socket.emit('boop');
    });

    socket.on('message', function(data){
        console.log("message was called");
//        socket.emit('boop');
    });
})
*/

var Server = require("./lib/Server.js");

new Server.Server(io).init();
