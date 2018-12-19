'use strict';

goog.provide('Blockly.Arduino');
goog.require('Blockly.Generator');

var profile = {
	arduino_leonardo: {
	    description: "ATmega32u4",
		dropdownPWM: [["3", "3"], ["5", "5"], ["6", "6"], ["9", "9"], ["10", "10"], ["11", "11"], ["13", "13"]],
		dropdownAnalog: [["A0", "A0"], ["A1", "A1"], ["A2", "A2"], ["A3", "A3"], ["A4", "A4"], ["A5", "A5"], ["A6(4)", "4"], ["A7(6)", "6"], ["A8(8)", "8"], ["A9(9)", "9"], ["A10(10)", "10"], ["A11(12)", "12"]],
		interrupt: [["3", "3"], ["2", "2"], ["0", "0"], ["1", "1"], ["7", "7"]],
		picture : "media/Arduino-Leonardo-Pinout.jpg",
		miniPicture : "media/Arduino-Leonardo-Pinout-mini.jpg",
		serial: [['300', '300'], ['600', '600'], ['1200', '1200'],
                ['2400', '2400'], ['4800', '4800'], ['9600', '9600'],
                ['14400', '14400'], ['19200', '19200'], ['28800', '28800'],
                ['31250', '31250'], ['38400', '38400'], ['57600', '57600'],
                ['115200', '115200']],
		serialPin: [["Rx/Tx", "0"]],
	},
	arduino_uno: {
	    description: "ATmega328p",
		dropdownPWM: [["3", "3"], ["5", "5"], ["6", "6"], ["9", "9"], ["10", "10"], ["11", "11"]],
		dropdownAnalog: [["A0", "A0"], ["A1", "A1"], ["A2", "A2"], ["A3", "A3"], ["A4", "A4"], ["A5", "A5"]],
		interrupt: [["2", "2"], ["3", "3"]],
		picture : "media/Arduino-Uno-Pinout.jpg",
		miniPicture : "media/Arduino-Uno-Pinout-mini.jpg",
		serial: [['300', '300'], ['600', '600'], ['1200', '1200'],
                ['2400', '2400'], ['4800', '4800'], ['9600', '9600'],
                ['14400', '14400'], ['19200', '19200'], ['28800', '28800'],
                ['31250', '31250'], ['38400', '38400'], ['57600', '57600'],
                ['115200', '115200']],
		serialPin: [["Rx/Tx", "0"]],
	},
	arduino_mega:{
		description: "ATmega2560",
		dropdownPWM: [["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["44", "44"], ["45", "45"], ["46", "46"]],
		dropdownAnalog: [["A0", "A0"], ["A1", "A1"], ["A2", "A2"], ["A3", "A3"], ["A4", "A4"], ["A5", "A5"], ["A6", "A6"], ["A7", "A7"], ["A8", "A8"], ["A9", "A9"], ["A10", "A10"], ["A11", "A11"], ["A12", "A12"], ["A13", "A13"], ["A14", "A14"], ["A15", "A15"]],
		interrupt: [["21", "21"], ["20", "20"], ["19", "19"], ["18", "18"], ["6", "6"], ["7", "7"]],
		picture : "media/Arduino-Mega-2560-Pinout.jpg",
		miniPicture : "media/Arduino-Mega-2560-Pinout-mini.jpg",
		serial: [['300', '300'], ['600', '600'], ['1200', '1200'],
                ['2400', '2400'], ['4800', '4800'], ['9600', '9600'],
                ['14400', '14400'], ['19200', '19200'], ['28800', '28800'],
                ['31250', '31250'], ['38400', '38400'], ['57600', '57600'],
                ['115200', '115200']],
		serialPin: [["Rx/Tx", "0"], ["Rx1/Tx1", "19"], ["Rx2/Tx2", "17"], ["Rx3/Tx3", "15"]],
	}
};

profile.defaultBoard = profile["arduino_uno"];

Blockly.Arduino.pinDigitalValidator = function(text) {
	var pos = profile.defaultBoard.digital.indexOf(text);
	return (pos < 0) ? null : text;
};

Blockly.Arduino.pinInterruptValidator = function(text) {
	var pos = profile.defaultBoard.interrupt.indexOf(text);	
	return (pos < 0) ? null : text;
};

Blockly.Arduino.pinSoftSerialValidator = function(text) {
	var pos = profile.defaultBoard.serialPin.indexOf(text);	
	return (pos < 0) ? null : text;
};

Blockly.Arduino.pinGroveDigitalValidator = function(text) {
	var pos = profile.defaultBoard.digital.indexOf(text);
	if (pos >= 0) {
		var NextPIN = parseInt(text) + 1;
		pos = profile.defaultBoard.digital.indexOf(String(NextPIN));
	}
	return (pos < 0) ? null : text;
};

Blockly.Arduino.pinPWMValidator = function(text) {
	var pos = profile.defaultBoard.PWM.indexOf(text);
	return (pos < 0) ? null : text;
};

Blockly.Arduino.pinAnalogValidator = function(text) {
	var pos = profile.defaultBoard.analog.indexOf(text);
	return (pos < 0) ? null : text;
};

Blockly.Arduino.pinGroveAnalogValidator = function(text) {
	var pos = profile.defaultBoard.analog.indexOf(text);
	if (pos >= 0) {
	    var NextPIN = 'A'+(parseInt(text.slice(1,text.length))+1);
		pos = profile.defaultBoard.analog.indexOf(String(NextPIN));
	}
	return (pos < 0) ? null : text;
};

Blockly.Arduino.pinDualValidator = function(text) {
	var posa = profile.defaultBoard.analog.indexOf(text);
	var posd = profile.defaultBoard.digital.indexOf(text);
	var pos = posa + posd
	return (pos < 0) ? null : text;
};