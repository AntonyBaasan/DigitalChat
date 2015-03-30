var assert = require("assert");
var should = require("should");

//var should = require('should');
var io = require('socket.io-client');
var socketURL = "http://localhost:4567";

var options = {
    transports: ['websocket'],
    'forceNew': true
};

var chatUser1 = { "name": "Tom" };
var chatUser2 = { "name": "Sally" };
var chatUser3 = { "name": "Dana" };

var messagesCount = 0;

describe("Digital Chat Socket :: ", function () {
    describe("Login and name errors :", function () {
        it("should login to server", function (done) {
            var client1 = io.connect(socketURL, options);
            //Connect First client
            client1.on('connect', function (data) {
                client1.emit("login", { "fromUser": "Antony" });
            });

            client1.on("welcome", function (data) {
                data["content"].should.equal("Welcome!");
                client1.disconnect();
                done();
            });
        });

        it("should raise error if user with wrong name", function (done) {
            messagesCount = 0;
            var client1 = io.connect(socketURL, options);
            //Connect First client
            client1.on('connect', function (data) {
                //empty name
                client1.emit("login", { "fromUser": "" });
                //name is less then 3
                client1.emit("login", { "fromUser": "ab" });
                //name is more then 16
                client1.emit("login", { "fromUser": "dkasdfasdrewqrsdfgsdfgs" });
            });

            client1.on("err", function (data) {
                data["content"].should.equal("Bad user name!");

                messagesCount++;
                if (messagesCount == 2) {
                    client1.disconnect();
                    done();
                }

            });
        });

        it("should raise error if user with same 'SOCKET' logged in ", function (done) {
            var client1 = io.connect(socketURL, options);
            //Connect First client
            client1.on('connect', function (data) {
                client1.emit("login", { "fromUser": "Antony" });
            });

            client1.on("welcome", function (data) {
                data["content"].should.equal("Welcome!");
                client1.disconnect();
                done();
            });
        });


        it("should raise error if user with same name logged in", function (done) {
            var client1, client2;

            messagesCount = 0;
            varCheckLogin = function (client, eventName, resultString) {
                client.on(eventName, function (data) {
                    data["content"].should.equal(resultString);

                    messagesCount++;
                    if (messagesCount == 2) {
                        client1.disconnect();
                        client2.disconnect();
                        done();
                    }
                });
            };

            client1 = io.connect(socketURL, options);
            varCheckLogin(client1, 'welcome', "Welcome!");

            //Connect First client
            client1.on('connect', function (data) {
                client2 = io.connect(socketURL, options);

                client1.emit("login", { "fromUser": "Client1" });

                varCheckLogin(client2, 'err', "Name 'Client1' already exists!");
                client2.on('connect', function (data) {
                    client2.emit("login", { "fromUser": "Client1" });
                });
            });
        });

    });

    describe("Main functionalities :", function () {
        it("getOnlinePeers functionality - should have two users after two login", function (done) {
            var client1, client2;

            //Connect First client
            var client1 = io.connect(socketURL, options);
            client1.on('connect', function (data) {
                client1.emit("login", { "fromUser": "Client1" });
            });

            //Connect First client
            var client2 = io.connect(socketURL, options);
            client2.on('connect', function (data) {
                client2.emit("login", { "fromUser": "Client2" });
            });

            client1.on("welcome", function (data) {
                client1.emit("getOnlinePeers", { "fromUser": "Client1" });
            });

            client1.on("getOnlinePeers", function (data) {
                data["content"][0].should.equal("Client1");
                data["content"][1].should.equal("Client2");

                client1.disconnect();
                client2.disconnect();
                done();
            });
        });


        it("disconnect user - should have one users after disconnect", function (done) {
            var client1, client2;

            //Connect First client
            var client1 = io.connect(socketURL, options);
            client1.on('connect', function (data) {
                client1.emit("login", { "fromUser": "Client1" });
            });

            //Connect First client
            var client2 = io.connect(socketURL, options);
            client2.on('connect', function (data) {
                client2.emit("login", { "fromUser": "Client2" });
            });

            client1.on("welcome", function (data) {
                client1.emit("getOnlinePeers", { "fromUser": "Client1" });
            });

            client1.on("getOnlinePeers", function (data) {
                messagesCount++;

                //first time when we call 
                if (messagesCount == 1) {
                    data["content"][0].should.equal("Client1");
                    data["content"][1].should.equal("Client2");
                    data["content"].lenght.should.be(2);
                    console.log("disconnect client2");
                    client2.disconnect();
                }
                //second time when we call 
                if (messagesCount == 2) {
                    data["content"][0].should.equal("Client1");
                    data["content"].lenght.should.be(1);

                    client1.disconnect();
                    done();
                }
            });

            client2.on("disconnect", function (data) {
                console.log("disconnect client2");
                client1.emit("getOnlinePeers", { "fromUser": "Client1" });
            });

        });

    });
});