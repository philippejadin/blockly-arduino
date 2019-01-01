// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


var arduino_cli_wrapper = require('arduino-cli').default;
var jquery = require('jquery');


// Helper function append a message to the bottom console (end user ui, not the developper's console)
function log(message) {
  $('#console').append('<div>' + message + '</div>');
}

// initialize arduino cli
if (process.platform === "win32") {
  arduino_cli_binary = './bin/arduino-cli.exe';
} else {
  arduino_cli_binary = './bin/arduino-cli'
}

const cli = arduino_cli_wrapper(arduino_cli_binary, {
  arduino_data: './arduino-cli/data',
  sketchbook_path: './arduino-cli/sketches',
});

// update index just to be sure
cli.core.updateIndex().then(function(result) {
  console.log('Index updated successfuly : ' + result); // "Stuff worked!"
}, function(err) {
  console.error(err); // Error: "It broke"
});

// make a list of available boards and log it
cli.listAvailableBoards().then(function(result) {
  console.log('Loaded list of avail boards successfuly');
  console.log(result)
  log(result.length + ' boards found');
  result.forEach(function(board) {
    $('#uploader_boards').append('<option name=' + board.package + '>' + board.name + '</option>');
  });
}, function(err) {
  console.error(err); // Error: "It broke"
});
