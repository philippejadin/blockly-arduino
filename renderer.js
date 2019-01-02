// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


var arduino_cli_wrapper = require('arduino-cli').default;
var jquery = require('jquery');
const os = require('os');


// Helper function append a message to the bottom console (end user ui, not the developper's console)
// TODO : Need refactor into a separate small module (or find an existing one in npm
function log(message) {
  $('#console').append('<div>' + message + '</div>');
}

// initialize arduino cli
if (process.platform === "win32") {
  arduino_cli_binary = './arduino-cli/arduino-cli.exe';
} else {
  arduino_cli_binary = './arduino-cli/arduino-cli';
}

// Those folders are the default for arduino IDE so boards, libraries and sketches are synced with arduino ide
// You might want this or not

const myarduino_data = os.homedir() + '/.arduino15';
const mysketchbook_path = os.homedir() + '/Arduino';


const cli = arduino_cli_wrapper(arduino_cli_binary, {
  arduino_data: myarduino_data,
  sketchbook_path: mysketchbook_path
});

// update index of available ardino boards just to be sure
cli.core.updateIndex().then(function(result) {
  console.log('Index updated successfuly');
}, function(err) {
  console.error(err);
});


// List installed cores
cli.core.list().then(function(result) {
    console.log('List of cores installed : ');
    console.log(result);
  },
  function(err) {
    console.error(err);
  });


// Install the arduino:avr core
cli.core.download(function() {}, 'arduino:avr').then(function(result) {
    console.log('Core downloaded');
    console.log(result);
  },
  function(err) {
    console.error(err);
  });



// make a list of available boards and log it
cli.listAvailableBoards().then(function(result) {
  console.log('Loaded list of avail boards successfuly');
  console.log(result)
  log(result.length + ' available boards found');
  result.forEach(function(board) {
    $('#uploader_boards').append('<option name="' + board.package + '">' + board.name + '</option>');
  });
}, function(err) {
  console.error(err);
});



// make a list of connected boards and log it
cli.listConnectedBoards().then(function(result) {
  console.log('Loaded list of connected boards successfuly');
  console.log(result)
  log(result.length + ' connected boards found');
  result.forEach(function(board) {
    $('#uploader_ports').append('<option name="' + board.port + '">' + board.port + ' (' + board.port + ')</option>');
    $('#uploader_boards').prepend('<option selected="selected" name="' + board.fqbn + '">' + board.name + ' (' + board.port + ')</option>');
  });
  if (result.length == 0) {
    $('#uploader_ports').append('<option name="none">No board found, please connect one and restart app</option>');
    log('No board found, please connect one and restart app');
  }
}, function(err) {
  console.error(err);
});
