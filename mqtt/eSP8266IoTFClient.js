var iotApplicationClient = require("iotclient");

var eSP8266IoTFClient = exports;

// massage arrived callbacks
//override with - function(deviceID, payload, format, payloadString, topic)
//payload maybe null is format is other then json
eSP8266IoTFClient.SendDataMessageArrived = null;

//device status callbacks
//override with - function(id, payload)
eSP8266IoTFClient.onESP8266Connected = null;
eSP8266IoTFClient.onESP8266Disconnected = null;


eSP8266IoTFClient.connectToBroker = function(credentials) {	
    this.iotClient = new iotApplicationClient("appwithdevicemap" + credentials.apiKey, credentials.apiKey, credentials.apiToken, credentials.mqtt_host);    
    //connect to broker
    this.iotClient.connectBroker(credentials.mqtt_u_port);  
    // Subscribe to device status
    this.iotClient.subscribeToDeviceStatus("ESP8266", "+");
    this.iotClient.callbacks.deviceStatus = eSP8266IoTFClient.dispatchDeviceStatus;
    // Subscribe to device events
    this.iotClient.callbacks.deviceEvent = eSP8266IoTFClient.dispatchDeviceEvent;
    this.iotClient.subscribeToDeviceEvents("ESP8266", "+", "SendData", "json");       
};

eSP8266IoTFClient.dispatchDeviceEvent = function (type, id, event, format, payload, topic) {
    if (iotAppMonitor) {
        iotAppMonitor.sendToClient('mqtt', "Message arrived, topic: '" + topic + "', payload: '" + payload + "'");
    } 
    var payloadObj = null;
	if(format == 'json')
		payloadObj = JSON.parse(payload).d;
	connectedDevicesCache.cacheDevice(type, id, payloadObj);
    switch (event){
    case "SendData":
    	if(eSP8266IoTFClient.SendDataMessageArrived)    		
    		eSP8266IoTFClient.SendDataMessageArrived(id, payloadObj, format, payload, topic);
    	break;        
    };
   
};

eSP8266IoTFClient.dispatchDeviceStatus = function (type, id, payload, topic) {	var payloadObj = JSON.parse(payload);
	switch (payloadObj.Action){
	case "Connect":
		connectedDevicesCache.cacheDevice(type, id);
		if(eSP8266IoTFClient.onESP8266Connected)
			eSP8266IoTFClient.onESP8266Connected(id, payloadObj);
		break;
	case "Disconnect":
		connectedDevicesCache.deleteDevice(type, id);
		if(eSP8266IoTFClient.onESP8266Disconnected)
			eSP8266IoTFClient.onESP8266Disconnected(id, payloadObj);
		break;
	}
	
};    

eSP8266IoTFClient.disconnectBroker = function(){
	if(this.iotClient) {
		this.iotClient.disconnectBroker();
		this.iotClient = null;
	}
};

eSP8266IoTFClient.getIOTFClient = function(){
    return this.iotClient;
};
