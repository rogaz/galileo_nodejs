var io = require('socket.io').listen(81);
var fs = require('fs');

var vars = [
    {
        "port": 27, // maps to digital PIN7
        "vel": 1000,
        "stop": true,
        "vel_min": 30,
        "intervalo": 50,
        "data": 0,
        "status": 0
    },
    {
        "port": 19, // maps to digital PIN9
        "vel": 1000,
        "stop": true,
        "vel_min": 30,
        "intervalo": 50,
        "data": 0,
        "status": 0
    }
];

io.on('connection', function(socket) {
	console.log('user connected');
    socket.emit('get_status', get_status());

	socket.on('prender', function(msg) {
		console.log('prendido!');
        vars[msg].stop = true;
		writeGpio(vars[msg].port, 1);
	});
	
	socket.on('apagar', function(msg){
		console.log('apagado!');
        vars[msg].stop = true;
		writeGpio(vars[msg].port, 0);
	});

	socket.on('speed_down', function(msg){
        if (vars[msg].vel == vars[msg].vel_min){
            vars[msg].vel = vars[msg].intervalo;
		} else {
            vars[msg].vel = vars[msg].vel + vars[msg].intervalo;
		}
        console.log('disminuye velocidad: ' + (vars[msg].vel));
    });
	
	socket.on('parpadear', function(msg){
        console.log('parpadea!');
		if (vars[msg].stop == true){
            vars[msg].stop = false;
	        parpadear(msg);
		}
    });

	socket.on('speed_up', function(msg){
		if (vars[msg].vel > vars[msg].intervalo){
            vars[msg].vel = vars[msg].vel - vars[msg].intervalo;
			console.log('aumenta velocidad: ' + vars[msg].vel);
		}else {
            vars[msg].vel = vars[msg].vel_min;
			console.log('La velocidad actual es ' + vars[msg].vel + ', imposible disminuirla.');
		}
        });
});

function parpadear(msg){
	if (!vars[msg].stop){

		setTimeout(function(){
			writeGpio(vars[msg].port, vars[msg].data);
			if (vars[msg].data == 0){
                vars[msg].data = 1;
			} else{
                vars[msg].data = 0;
			}
			if (!vars[msg].stop)
				parpadear(msg);
		}, vars[msg].vel);
	}
}

//var button_gpio = 17; // maps to digital PIN5 on the board
//var foco1 = 27; // maps to digital PIN7
//var foco2 = 28; // maps to digital PIN8

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
};
 
var setGpioIn = function(gpio_nr) {
  setGpioDirection(gpio_nr, 'in');
};
 
var setGpioOut = function(gpio_nr) {
  setGpioDirection(gpio_nr, 'out');
};
 
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
  var length = vars.length;
  var index;
  for(var i = 0 ; i < length ; i++){
    if(vars[i].port == gpio_nr)
        index = i;
  }

  (value == 1) ? io.sockets.emit('encender', index) : io.sockets.emit('apagar', index);
  fs.writeFile("/sys/class/gpio/gpio" + gpio_nr + "/value", value, fileOptions, function(err, data) {
    if (err) { console.log("Writing " + gpio_nr + " " + value); }
  });
};

var length = vars.length;
for(var i = 0; i < length; i++){
    exportGpio(vars[i].port);
    setGpioOut(vars[i].port);
    writeGpio(vars[i].port, vars[i].status);
}

function get_status(){
    return vars;
}

//exportGpio(foco1);
//exportGpio(button_gpio);
 
//setGpioOut(foco2);
//setGpioIn(button_gpio);

