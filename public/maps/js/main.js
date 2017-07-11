var connectedDevices = {};
var devicesIcons = [
                    "http://maps.google.com/mapfiles/ms/micons/purple-dot.png",
                    "http://maps.google.com/mapfiles/ms/micons/green-dot.png",
                    "http://maps.google.com/mapfiles/ms/micons/red-dot.png",
                    "http://maps.google.com/mapfiles/ms/micons/blue-dot.png",
                    "http://maps.google.com/mapfiles/ms/micons/yellow-dot.png",                    
                    "http://maps.google.com/mapfiles/ms/micons/ltblue-dot.png",
                    "http://maps.google.com/mapfiles/ms/micons/orange-dot.png",
                    "http://maps.google.com/mapfiles/ms/micons/pink-dot.png"
                    ];

var devicesTypes = [];

function initialize() {
	map = new google.maps.Map(document.getElementById('map-canvas'));
	map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('legend'));
	markers = {};
	updateConnectedDevices(fitBounds);
	setInterval(updateConnectedDevices, 5000);

};

function getDeviceLatLng(device){
	var lat = (device.lat) ? device.lat : (device.latitude) ? device.latitude : null;
	var lng = (device.lng) ? device.lng : (device.lon) ? device.lon : (device.longitude) ? device.longitude : null;
	if(!lat || !lng){
		console.error("Cannot get position for device " + device.deviceID);	
		return null;
	}
	return new google.maps.LatLng(lat, lng);

}

function updateLegend(){
	var legend = document.getElementById('legend');
	while (legend.firstChild != legend.lastChild) {
		legend.removeChild(legend.lastChild);
	}
	for (var i = 0; i < devicesTypes.length; i++) {
		var name = devicesTypes[i];
		var icon = devicesIcons[i];
		var div = document.createElement('div');
		div.innerHTML = '<img src="' + icon + '"> ' + name;
		legend.appendChild(div);
	}

};

function updateConnectedDevices(callback){
	$.getJSON('maps/connectedDevices',function(cachedDevices){
		console.log(cachedDevices);
		var newDeviceTypeAdded = false;
		for(var i = 0; i < cachedDevices.length; i++){
			var device = cachedDevices[i];
			if(!connectedDevices[device.deviceID]){// new device
				if(devicesTypes.indexOf(device.deviceType) == -1){
					devicesTypes.push(device.deviceType);
					newDeviceTypeAdded = true;
				}					
				connectedDevices[device.deviceID] = device;
				addMarker(device);			
			}
			else if(connectedDevices[device.deviceID].lastUpdateTime != device.lastUpdateTime){
				connectedDevices[device.deviceID] = device;
				var devicePosition = getDeviceLatLng(device);
				if(devicePosition && markers[device.deviceID] && 
						(markers[device.deviceID].position.lat() != devicePosition.lat() || markers[device.deviceID].position.lng() != devicePosition.lng())){
					markers[device.deviceID].setPosition(devicePosition);
				}		
			}
		}
		if(newDeviceTypeAdded)
			updateLegend();

		if(callback)
			callback();
	});

};

function fitBounds(){	
	var bounds = new google.maps.LatLngBounds();
	_.each(connectedDevices, function(device){
		var devicePosition = getDeviceLatLng(device);
		if(devicePosition)
			bounds.extend(devicePosition);
	});
	map.fitBounds(bounds);	
}

google.maps.event.addDomListener(window, 'load', initialize);

function addMarker(device) {
	var deviceId = device.deviceID;
	var latlng = getDeviceLatLng(device);
	if(!latlng){
		console.error("Cannot add marker for device " + device.deviceID);
		return; 
	}
	var title = (device.name) ? device.name : deviceId;
	markers[deviceId] = new google.maps.Marker({
		position: latlng,
		map: map,
		title: title,
		icon: devicesIcons[devicesTypes.indexOf(device.deviceType)]
	});
	var content = getInfoWindowContent(deviceId);
	console.log(content);
	var infoWindow = new google.maps.InfoWindow({ content: content });
	google.maps.event.addListener(markers[deviceId], 'click', function() {
		
		var updatedcontent = getInfoWindowContent(deviceId);
		infoWindow.setContent(updatedcontent);
		infoWindow.open(map, markers[deviceId]);
	});
};

function getInfoWindowContent(deviceID){
	var device = connectedDevices[deviceID];	
	var title = (device.name) ? device.name : deviceID;
	var content = "<div><h3>"+title+"</h3><ul><li>Device ID: " + device.deviceID + "</li><li>Device Type: " + device.deviceType;
	var devicesAttributes = _.omit(device, 'deviceID', 'deviceType', 'lastUpdateTime', 'lat', 'latitude', 'lng', 'lon' , 'longitude');
	var attrAndValues = _.pairs(devicesAttributes);
	for(var i = 0; i < attrAndValues.length; i++){
		var pair = attrAndValues[i];
		content += '<li>' + pair[0] + ': ' + pair[1] + "</li>";
	}

	var updateTime = new Date(device.lastUpdateTime).toUTCString();	
	content += "</li><li>Last Update Time: "+ updateTime +"</li></ul></div>";
	return content;

};


