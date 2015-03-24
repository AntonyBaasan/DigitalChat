var io = require('socket.io')({
    transports: ['websocket'],
});

io.attach(4567);

io.on('connection', function(socket){
    console.log("Connection");

    socket.on('beep', function(data){
        console.log("beep was called");
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
