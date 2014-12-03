var io = require('socket.io').listen(81);
var fs = require('fs');

io.on('connection', function(socket) {
	console.log('user connected');
	socket.on('adelante', function() {
		console.log('adelante');
        adelante();
	});
	
	socket.on('atras', function(){
		console.log('atras');
        atras();
	});

	socket.on('izquierda', function(){
        console.log('izquierda');
        izquierda();
    });
	
	socket.on('derecha', function(){
        console.log('derecha');
        derecha();
    });

    socket.on('detener', function(){
        console.log('detener');
        detener();
    });
});

var time = 200;

var atras = function(){
    detener();
    setTimeout(function(){
        motor_derecho_atras();
        motor_izquierdo_atras();
    }, time);
};

var adelante = function(){
    detener();
    setTimeout(function() {
        motor_derecho_adelante();
        motor_izquierdo_adelante();
    }, time);
};

var izquierda = function(){
    detener();
    setTimeout(function() {
        motor_izquierdo_atras();
        motor_derecho_adelante();
    }, time);
};

var derecha = function(){
    detener();
    setTimeout(function() {
        motor_derecho_atras();
        motor_izquierdo_adelante();
    }, time);
};

var detener = function(){
    detener_motor_derecho();
    detener_motor_izquierdo();
};

var motor_derecho_adelante = function(){
	writeGpio(motor_der_atras, 0);
	writeGpio(motor_der_adelante, 1);
};

var motor_derecho_atras = function(){
	writeGpio(motor_der_adelante, 0);
	writeGpio(motor_der_atras, 1);
};

var detener_motor_derecho = function(){
	writeGpio(motor_der_adelante, 0);
	writeGpio(motor_der_atras, 0);
};

var motor_izquierdo_adelante = function(){
	writeGpio(motor_izq_atras, 0);
	writeGpio(motor_izq_adelante, 1);
};

var motor_izquierdo_atras = function(){
	writeGpio(motor_izq_adelante, 0);
	writeGpio(motor_izq_atras, 1);
};

var detener_motor_izquierdo = function(){
	writeGpio(motor_izq_adelante, 0);
	writeGpio(motor_izq_atras, 0);
};

 
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
  //(value == 1) ? io.sockets.emit('encender') : io.sockets.emit('apagar');
  fs.writeFile("/sys/class/gpio/gpio" + gpio_nr + "/value", value, fileOptions, function(err, data) {
    if (err) { console.log("Writing " + gpio_nr + " " + value); }
  });
};

//var led_gpio    = 27; // maps to digital PIN7
var motor_der_atras = 24; // PIN0
var motor_der_adelante = 27; // PIN1

var motor_izq_atras = 19; // PIN9
var motor_izq_adelante = 16; // PIN10

exportGpio(motor_izq_adelante);
setGpioOut(motor_izq_adelante);

exportGpio(motor_izq_atras);
setGpioOut(motor_izq_atras);

exportGpio(motor_der_adelante);
setGpioOut(motor_der_adelante);

exportGpio(motor_der_atras);
setGpioOut(motor_der_atras);

//exportGpio(led_gpio);
//setGpioOut(led_gpio);


detener_motor_izquierdo();
detener_motor_derecho();
