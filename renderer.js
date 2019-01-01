// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


var arduino_cli_wrapper = require('arduino-cli').default;
//const homedir = require('os').homedir();

const cli = arduino_cli_wrapper('./bin/arduino-cli-0.3.3-alpha.preview-linux64', {
  arduino_data: './arduino-cli/data',
  sketchbook_path: './arduino-cli/sketches',
});


cli.core.updateIndex().then(function(result) {
  console.log('Index updated successfuly : ' + result); // "Stuff worked!"
}, function(err) {
  console.log('failure : ' + err); // Error: "It broke"
});


cli.listAvailableBoards().then(function(result) {
  console.log('Loaded list of avail boards successfuly : ' + result);
  console.log(result);
  document.getElementById('cb_cf_boards').textContent = 'Boards found';
}, function(err) {
  console.log('failure : ' + err); // Error: "It broke"
});
