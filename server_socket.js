
var io = require('socket.io').listen(81);
var fs = require('fs');

var vel = 1000;
var stop = true;
var vel_min = 30;
var intervalo = 50;

io.on('connection', function(socket) {
	console.log('user connected');
	socket.on('prender', function(msg) {
		console.log('prendido!'); stop = true;
		writeGpio(led_gpio, 1);
	});
	
	socket.on('apagar', function(){
		console.log('apagado!'); stop = true;
		writeGpio(led_gpio, 0);
	});

	socket.on('speed_down', function(){
                if (vel == vel_min){
			vel = intervalo; 
		} else {
			vel = vel + intervalo;
		}
                console.log('disminuye velocidad: ' + (vel));
        });
	
	socket.on('parpadear', function(){
                console.log('parpadea!');
		if (stop == true){
			stop = false;
	                parpadear();
		}
        });

	socket.on('speed_up', function(){
		if (vel > intervalo){
                	vel = vel - intervalo;
			console.log('aumenta velocidad: ' + vel);
		}else {
			vel = vel_min;
			console.log('La velocidad actual es ' + vel + ', imposible disminuirla.');
		}
        });
});

var data = 0;
function parpadear(){
	if (!stop){

		setTimeout(function(){
			writeGpio(led_gpio, data);
			if (data == 0){
				data = 1;
			} else{
				data = 0;
			}
			if (!stop)
				parpadear();
		}, vel);
	}
}

//var button_gpio = 17; // maps to digital PIN5 on the board
var led_gpio    = 27; // maps to digital PIN7
 
var fileOptions = {encoding: 'ascii'};
 
var exportGpio = function(gpio_nr) {
  fs.writeFile('/sys/class/gpio/export', gpio_nr, fileOptions, function (err) {
    if (err) { console.log("Couldn't export %d, probably already exported.", gpio_nr); }
  });
};
 
var setGpioDirection = function(gpio_nr, direction) {
  fs.writeFile("/sys/class/gpio/gpio" + gpio_nr + "/direction", direction, fileOptions, function (err) {
    if (err) { console.log("Could'd set gpio" + gpio_nr + " direction to " + direction + " - probably gpio not available via sysfs"); }
  });
}
 
var setGpioIn = function(gpio_nr) {
  setGpioDirection(gpio_nr, 'in');
}
 
var setGpioOut = function(gpio_nr) {
  setGpioDirection(gpio_nr, 'out');
}
 
// pass callback to process data asynchroniously
var readGpio = function(gpio_nr, callback) {
  var value;
  
  fs.readFile("/sys/class/gpio/gpio" + gpio_nr + "/value", fileOptions, function(err, data) {
    if (err) { console.log("Error reading gpio" + gpio_nr); }
    value = data;
    callback(data);
  });
  return value;
};
 
var writeGpio = function(gpio_nr, value) {
  (value == 1) ? io.sockets.emit('encender') : io.sockets.emit('apagar');
  fs.writeFile("/sys/class/gpio/gpio" + gpio_nr + "/value", value, fileOptions, function(err, data) {
    if (err) { console.log("Writing " + gpio_nr + " " + value); }
  });
};
 
exportGpio(led_gpio);
//exportGpio(button_gpio);
 
setGpioOut(led_gpio);
//setGpioIn(button_gpio);

