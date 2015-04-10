var _ = require("underscore");

// User Model
var User = function (args) {
    var self = this;

    // Socket field
    self.socket = args.socket;
    // username field
    self.user = args.user;
}

var Message = function (args) {
    var self = this;

    self.fromUser = args.fromUser;
    self.toUser = args.toUser;
    self.data = args.data;
    self.type = args.type;
    self.time = args.time;
}

var Server = function (io) {
    var self = this;
    self.io = io;

    //All user list
    self.users = [];


    //Init function
    self.init = function () {
        self.io.on("connection", function (socket) {
            console.log("Someone connected...");

            self.handleConnection(socket);

            
            socket.on('disconnect', function () {
                var foundUser = _.find(self.users, function (item) {
                    return socket == item.socket;
                });

                //NOTE:User can be removed from list at LOGOUT
                if (foundUser) {
                    // remove the user from list
                    self.users.splice(self.users.indexOf(foundUser), 1);
                    //send user left message to all sockets
                    self.io.sockets.emit('userDisconnected', { fromUser: foundUser.user });
                }
            });

        });

        console.log("DigitalChat started...");
    };

    //Handle income connection
    self.handleConnection = function (socket) {
        socket.on('login', function (data) {
            var username = data["fromUser"];

            //check if name length is OK
            if (!username || username.length < 3 || username.length > 10) {
                socket.emit('err', { content: "Bad user name!" });
                return;
            }

            //if name already exists
            var isNameExists = _.some(self.users, function (item) {
                return item.user == username;
            });
            if (isNameExists) {
                socket.emit('err', { content: "Name '" + username + "' already exists!" });
                return;
            }

            //if socket already exists
            var isSocketExists = _.some(self.users, function (item) {
                return item.socket == socket;
            });
            if (isSocketExists) {
                socket.emit('err', { content: "Can't login twice!" });
                return;
            }

            console.log("User '" + username + "' logged in.");
            //Create new user
            var newUser = new User({ user: username, socket: socket });
            //Save the user in list
            self.users.push(newUser);
            //Attach listener functions
            self.attachListeners(newUser);
            //Broadcast about just entered user. (socket.broadcast doesn't send to self)
            socket.broadcast.emit("userConnected", { fromUser: username });
            socket.emit("welcome", { content: "Welcome!" });

        });

    };

    //Add Listenter functions to user login
    self.attachListeners = function (user) {
        user.socket.on("getOnlinePeers", function (data) { self.onGetOnlinePeers(user, data); });
        user.socket.on("talkToPeer", function (data) { self.onTalkToPeer(user, data); });
        user.socket.on("logout", function (data) { self.onLogout(user, data); });

        // user.socket.on("broadcast", function(data){self.onBroadcast(user, data);});
    };

    //Remvoe Listenters on user login
    self.removeListeners = function (user) {
        cbProxy = function () { };
        user.socket.removeListener("getOnlinePeers", cbProxy);
        user.socket.removeListener("talkToPeer", cbProxy);
        user.socket.removeListener("logout", cbProxy);
    };

    self.onDisconnect = function (user, data) {

        console.log("User '" + user.user + "' disconnected.");
        // remove the user from list
        self.users.splice(self.users.indexOf(user), 1);
        //send user left message to all sockets
        self.io.sockets.emit('userDisconnected', { fromUser: user.user }); //socket.broadcast.emit('userDisconnected', "User '"user.user"' has disconnected");
    };

    //return all online user list
    self.onGetOnlinePeers = function (user, data) {
        console.log("User '" + user.user + "' called onGetOnlinePeers.");
        //get user list
        var users = _.map(self.users, function (item) {
            return item.user;
        });

        user.socket.emit('getOnlinePeers', { content: users });
    };

    //Send chat to user
    self.onTalkToPeer = function (user, data) {
        console.log("User '" + user.user + "' called onTalkToPeer. data['toUser']: " + data['toUser'] + ", data['content']" + data['content']);

        if (!data['toUser'])
            return;

        var foundUser = _.find(self.users, function (item) {
            if (data['toUser'] == item.user) {
                return true;
            }
        });

        if (foundUser)
            foundUser.socket.emit("talkToPeer", { fromUser: user.user, toUser: data['toUser'], content: data['content'], msgType: data['msgType'] });
    };

    // self.onBroadcast = function (user, data) { };

    self.onLogout = function (user, data) {
        
        var foundUser = _.find(self.users, function (item) {
            return user.socket == item.socket;
        });

        if (foundUser) {
            user.socket.broadcast.emit("userDisconnected", { fromUser: foundUser.user });
            self.users.splice(self.users.indexOf(foundUser), 1);
            console.log("User '" + user.user + "' logout. left :" + self.users.length + " users");
            //remove events listeting
            self.removeListeners(user);
        }
    };

};

module.exports = { Server: Server };