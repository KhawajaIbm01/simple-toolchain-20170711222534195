// 
// Monitor for http and mqtt messages using WebSocket library 'socket.io'
//  

module.exports = function (server) {
	
	var io = require('socket.io')(server);

	io.on('connection', function(socket){
		//socket.emit('iotwb-http', { message: 'Connected to application. Waiting for http calls.' });
		//socket.emit('iotwb-mqtt', { message: 'Connected to application. Waiting for mqtt calls.' });
		//socket.on('event', function(data){});
		//socket.on('disconnect', function(){});
	});
	
	return {
		sendToClient: function(protocol, msg){
			io.sockets.emit('iotwb-' + protocol, { message: msg});
		}
	}
} 