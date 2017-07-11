var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var routes = require('./routes/index');

var esp8266mapDebug = null;
//require user extentions  
try {
	esp8266mapDebug = require("./esp8266mapDebug.js");	
} catch (e) {
	try {
		esp8266mapDebug = require("./_debug.js");			
	} catch (e) {
		console.log("For Debug add _debug.js or esp8266mapDebug.js");
	};	
}

//There are many useful environment variables available in process.env.
//VCAP_APPLICATION contains useful information about a deployed application.
var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");
//TODO: Get application information and use it in your app.

//VCAP_SERVICES contains all the credentials of services bound to
//this application. For details of its content, please refer to
//the document or sample of each service.
VCAP_SERVICES = {};
if(process.env.VCAP_SERVICES)
	VCAP_SERVICES = JSON.parse(process.env.VCAP_SERVICES);
//try and get vcap from debug  
else if (esp8266mapDebug && esp8266mapDebug.VCAP_SERVICES)
	VCAP_SERVICES = esp8266mapDebug.VCAP_SERVICES;



//The IP address of the Cloud Foundry DEA (Droplet Execution Agent) that hosts this application:
var host = (process.env.VCAP_APP_HOST || 'localhost');

//global connectedDevicesCache
connectedDevicesCache = require('./lib/connectedDevicesCache');



//global HTTP routers

//get IoT-Foundation credentials
if(!VCAP_SERVICES || !VCAP_SERVICES["iotf-service"])
	throw "Cannot get IoT-Foundation credentials"
var iotfCredentials = VCAP_SERVICES["iotf-service"][0]["credentials"];

//global IoT-Foundation connectors 
eSP8266IoTFClient = require('./mqtt/eSP8266IoTFClient'); 
eSP8266IoTFClient.connectToBroker(iotfCredentials);
	
var app = express();
//set the app object to export so it can be required 
module.exports = app;
var server = require('http').Server(app);
iotAppMonitor = require('./lib/iotAppMonitorServer')(server);

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
//allow cross domain calls
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', routes);
app.use(express.static(path.join(__dirname, 'public')));




//iot-workbench additional requires   
try {
	require("./_requires.js");	
} catch (e) {	
		//no iot-workbench additional _requires;		
}


//catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

//error handlers

//development error handler
//will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

//production error handler
//no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

app.set('port', process.env.VCAP_APP_PORT || 3000);

//require user extensions  
try {
	require("./esp8266map.js");	
} catch (e) {
	try {
		require("./_app.js");			
	} catch (e) {
		console.log("Failed to load extention files _app.js or esp8266map.js: " + e.message);
	};	
}

//Start server
server.listen(app.get('port'), function() {
	console.log('Server listening on port ' + server.address().port);
});


