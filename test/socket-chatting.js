var assert = require("assert");
var should = require("should");

//var should = require('should');
var io = require('socket.io-client');
var socketURL = "http://localhost:4567";

var options = {
    transports: ['websocket'],
    'forceNew': true
};

var messagesCount = 0;

describe("Digital Chat Socket Test :: ", function () {
    describe("Chatting :", function () {
        it("should send chat to directed user", function (done) {
            var client1, client2;

            //Connect first client
            var client1 = io.connect(socketURL, options);
            client1.on('connect', function (data) {
                //Login first client
                client1.emit("login", { "fromUser": "Client1" });
            });

            var client2 = io.connect(socketURL, options);
            client2.on('connect', function (data) {
                client2.emit("login", { "fromUser": "Client2" });
            });

            client1.on("welcome", function (data) {
                setTimeout(function () {
                    client1.emit("talkToPeer", { "fromUser": "Client1", "toUser": "Client2", "content": "Hello world" });
                }, 500);
            });

            client2.on("talkToPeer", function (data) {
                assert.equal(data["content"], "Hello world");
                assert.equal(data["fromUser"], "Client1");

                client1.disconnect();
                client2.disconnect();
                done();
            });
        });

        /*
        it("disconnect user - should have one users after disconnect", function (done) {
            var client1, client2;
            messagesCount = 0;

            //Connect First client
            var client1 = io.connect(socketURL, options);
            client1.on('connect', function (data) {
                client1.emit("login", { "fromUser": "Client1" });
            });

            //Connect Second client
            var client2 = io.connect(socketURL, options);
            client2.on('connect', function (data) {
                client2.emit("login", { "fromUser": "Client2" });
            });

            client1.on("welcome", function (data) {
                setTimeout(function () {
                    client1.emit("getOnlinePeers", { "fromUser": "Client1" });
                }, 500);
            });

            client1.on("getOnlinePeers", function (data) {
                messagesCount++;

                //first time when we call 
                if (messagesCount == 1) {
                    assert.equal(data["content"].length, 2);

                    client2.disconnect();
                }
                //second time when we call 
                if (messagesCount == 2) {
                    assert.equal(data["content"][0], "Client1");
                    assert.equal(data["content"].length, 1);

                    client1.disconnect();
                    done();
                }
            });

            client1.on("userDisconnected", function (data) {
                setTimeout(function () {
                    client1.emit("getOnlinePeers", { "fromUser": "Client1" });
                }, 500);

            });
        });


        it("disconnect user - should send 'userDisconnected' event to rest users when one of users disconnected", function (done) {
            var client1, client2;
            messagesCount = 0;
            varCheckUsedDisconnection = function (data, resultString) {
                assert.equal(data["fromUser"], resultString);
                messagesCount++;
                if (messagesCount == 1) {
                    client1.disconnect();
                    client2.disconnect();
                    done();
                }
            };
            //Connect First client
            var client1 = io.connect(socketURL, options);
            client1.on('connect', function (data) {
                client1.emit("login", { "fromUser": "Client1" });
            });

            //Connect Second client
            var client2 = io.connect(socketURL, options);
            client2.on('connect', function (data) {
                client2.emit("login", { "fromUser": "Client2" });
            });

            //Connect Third client
            var client3 = io.connect(socketURL, options);
            client3.on('connect', function (data) {
                client3.emit("login", { "fromUser": "Client3s" });
            });

            client1.on("welcome", function (data) {
                setTimeout(function () {
                    client1.disconnect();
                }, 500);
            });

            client2.on("userDisconnected", function (data) {
                varCheckUsedDisconnection(data, "Client1");

            });
            client3.on("userDisconnected", function (data) {
                varCheckUsedDisconnection(data, "Client1");
            });
        });

        */

    });
});