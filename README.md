# Blockly arduino
Blockly arduino IDE

Based on blockly arduino created par JP-Fontaine : http://lesormeaux.net/blockly-arduino/start.html
Itself based on Blockly@arduino : http://technologiescollege.github.io/Blockly-at-rduino/


# How to create new blocks?

Just create a directory inside /blocks with 2 files : definition.js and generator.js

Then run python tools/generate.py

To recreate the JS files from your blocks

# Development
This project is at the start pure JS/HTML using google blockly. Just open index.html in your browser to use it directly.

The desktop app is done with electron and nodejs where needed. This allows to communicate with a connected arduino and compule / upload code directly from the dedicated app.

- Install nvm to install a specific node version so we all work with  the same system. I recommend node 10 (lts) : nvm install node@10
- Install all dependencies :  npm install
- Launch the application : npm start

In the future build scripts will be provided for each major platform (windows, mac and linux)
