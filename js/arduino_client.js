import arduinoCli from 'arduino-cli'


const cli = arduinoCli('/bin/arduino-cli', {
  arduino_data: '~/arduino-cli/data',
  sketchbook_path: '~/arduino-cli/sketches',
});


  cli.version().then(console.log); // "0.2.1-alpha.preview"
