
var arduino_cli_wrapper = require('arduino-cli').default;
//const homedir = require('os').homedir();

const cli = arduino_cli_wrapper('./arduino-cli-0.3.3-alpha.preview-linux64', {
  arduino_data: './arduino-cli/data',
  sketchbook_path: './arduino-cli/sketches',
});


cli.core.updateIndex().then(function(result) {
  console.log(result); // "Stuff worked!"
}, function(err) {
  console.log('failure : ' + err); // Error: "It broke"
});
