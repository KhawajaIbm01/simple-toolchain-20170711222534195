# AppWithDeviceMap
### Generated by IoT-Workbench
To override callback functions below and add application code create a file called **_app.js** in the root directory of the project









###MQTT connectors:
######powered By IBM IoT Foundation

###Messages from ESP8266:

####Incoming Messages:

#####Message: SendData
#####topic: /iot-2/type/ESP8266/id/+/evt/SendData/fmt/json

######Expected payload: 
```javascript
- name
- lat
- lon
- ADC
```
######Callback example: 
```javascript
eSP8266IoTFClient.SendDataMessageArrived  = function(deviceID, payload) {
...
}
```



####Connect\Disconnect Messages:

#####Message: ESP8266Connected
#####topic: /iot-2/type/ESP8266/id/+/mon
######Callback example: 
```javascript
eSP8266IoTFClient.onESP8266Connected  = function(deviceID, payload) {
...
}
```

#####Message: ESP8266Disconnected
#####topic: /iot-2/type/ESP8266/id/+/mon
######Callback example: 
```javascript
eSP8266IoTFClient.onESP8266Disconnected  = function(deviceID, payload) {
...
}
```





###Globals:
#####VCAP_SERVICES
VCAP_SERVICES object contains all the credentials of services bound to
this application.

For details of its content, please refer to
the document or sample of each service.
######usage example:
```javascript
var iotfCredentials = VCAP_SERVICES["iotf-service"][0]["credentials"];
console.log(iotfCredentials);
=>
{ 
  iotCredentialsIdentifier: 'a2xxk39sl6r5',
  mqtt_host: 'myOrg.messaging.internetofthings.ibmcloud.com',
  mqtt_u_port: 1883,
  mqtt_s_port: 8883,
  base_uri: 'https://myOrg.internetofthings.ibmcloud.com:443/api/v0001',
  http_host: 'myOrg.internetofthings.ibmcloud.com',
  org: 'myOrg',
  apiKey: 'a-myOrg-p6yc3aqwfy',
  apiToken: 'lQgpoOIAW_6SogZRQC'
}

```



#####connectedDevicesCache:
connectedDevicesCache contains in memory cache of connected devices data. 

You can use this cache to get the last values of all devices, all devices of a specific type or a specific device
instead of listening to message callbacks.

Every cached device is an object containing the device last values as received by the application.
In addition, it contains the last update time (e.g. the last time when values were changed in milliseconds since 1970). 
######get cached device example:
```javascript
var device = connectedDevicesCache.getConnectedDevice("myDeviceID");
console.log(device);
=>
{ 
  deviceID: 'myDeviceID',
  deviceType: 'TempCtrl',
  actualTemp: 30,
  desiredTemp : 25,
  lastUpdateTime: 1445868136123
}

```
######get cached devices of type example:
```javascript
var tempCtrlDevicesArray = connectedDevicesCache.getConnectedDevicesOfType("TempCtrl");

```
######get all cached devices example:
```javascript
var allConnectedDevicesArray = connectedDevicesCache.getConnectedDevices();

```

