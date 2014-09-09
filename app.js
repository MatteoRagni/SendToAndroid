// Some debugging options
var gui = require('nw.gui');
if (__debug) {
	function debugmsg(message) {
		var d = new Date();
		console.log("DEBUG\n" + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "." + d.getMilliseconds() + " :: " + message);
	}
} else {
	//function debugmsg(message) { }
}

// Move the window in position
var win = gui.Window.get();
win.moveTo(position.x,position.y)

var exec = require('child_process').exec;

// Object contains an istance of adb to send commands
function adb_obj(cmd) {
	var exec = require('child_process').exec;
	this.cmd = cmd;
	this.run = function(args) {
		exec('adb shell ' + this.cmd + ' ' + args, 
			function(error,stdout,stderr) {
				if (error != null) { alert("EXEC ERROR: " + error); }
				if (__debug) {
					debugmsg("STDOUT\n" + stdout);
					debugmsg("STDERR\n" + stderr);
				}
			});
		debugmsg("RUN adb shell " + this.cmd + " " + args);
	}
}

// Object: contains the string that should be send
function message_obj(input) {
	this.normal = input;
	
	var splitted = input.split(" ");
	var converted = "";
 	splitted.forEach(function(x) {
  		converted = converted + x + '%s';
 	});
 	this.modified = '"' + converted + '"';

 	debugmsg(this.modified);
 	
 	var adb_cnt = new adb_obj("input text");
 	this.send = function() {
 		adb_cnt.run(this.modified);
 	};
};

// Object: unlock system
var powerbutton = "keyevent " + unlock_cfg.unlockcode;
var unlockswipe = "touchscreen swipe" + " " + unlock_cfg.X1 + " " + unlock_cfg.Y1 + " " + unlock_cfg.X2 + " " + unlock_cfg.Y2; 
function unlock_obj(config) {

	this.power = function() {
		var adb_cnt = new adb_obj("input");
		debugmsg("powerButton called!");
		adb_cnt.run(powerbutton);
	}

	this.swipe = function() {
		var adb_cnt = new adb_obj("input");
		debugmsg("Swipe called!");
		adb_cnt.run(unlockswipe);
	}

	this.run = function() {
		this.power();
		setTimeout(this.swipe, 2000);
	}
}

function keycode() {
	var adb_cnt = new adb_obj('input keyevent');

	this.run = function(code) {
		debugmsg("keyCode called!");
		var ret;
		switch(code) {
			case "Left": ret = "KEYCODE_DPAD_LEFT"; break;
			case "Right": ret = "KEYCODE_DPAD_RIGHT"; break;
			case "Up": ret = "KEYCODE_DPAD_UP"; break;
			case "Down": ret = "KEYCODE_DPAD_DOWN"; break;

			case "U+0008": ret = "KEYCODE_DEL"; break;
			//case "U+007F": ret = "KEYCODE_DEL"; break;
		}

		adb_cnt.run('"'+ ret +'"');
	}
} 

var keyCodeHdl = new keycode();

// MAIN

function sendClick() {
	msg = new message_obj(document.getElementById('source').value);
	msg.send();
	document.getElementById('source').value = "";
	document.getElementById('source').focus();
}

function unlock() {
	var unlock_h = new unlock_obj(unlock_cfg);
	unlock_h.run();
}

function unlockandsendClick() {
	unlock();
	setTimeout(sendClick, 4000);
}

// Event Handler
function keydownhdl(e) {
	debugmsg("key: " + e.keyIdentifier + " | ctrl: " + e.ctrlKey + " | alt: " + e.altKey);
	if (e.keyIdentifier == "U+001B") {
		window.close();
	} else if (e.keyIdentifier == "Enter" && e.altKey) {
		sendClick();
	} else if (e.keyIdentifier == "Enter" && e.ctrlKey) {
		unlockandsendClick();
	} else if (e.altKey && !(e.keyIdentifier == "Enter")) {
		keyCodeHdl.run(e.keyIdentifier);
	} else if (e.keyIdentifier == "U+0055" && e.ctrlKey) {
		unlock();
	} else if (e.keyIdentifier == "F12") {
		gui.Window.get().showDevTools();
	}
}

// Setting keybinding
function setOnLoad() {
	document.getElementsByTagName('body')[0].addEventListener("keydown", keydownhdl);	
};
