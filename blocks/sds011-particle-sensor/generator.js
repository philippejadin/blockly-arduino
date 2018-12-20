Blockly.Arduino.sds011 = function(block) {
  var rx = block.getFieldValue('RX');
  var tx = block.getFieldValue('TX');
  Blockly.Arduino.includes_.sds011 = '#include "SdsDustSensor.h"';
  //Blockly.Arduino.variables_['sds011'] = 'placer ici le code de mes variables';
  Blockly.Arduino.definitions_.sds011 = 'SdsDustSensor sds(' + rx + ', ' + tx + ');';
  Blockly.Arduino.userFunctions_.sds011 = `float sds011Read(int type)
{
  PmResult pm = sds.queryPm();
  if (pm.isOk()) {
    if (type == 10)
    {
      return pm.pm10;
    }
    if (type == 25)
    {
      return pm.pm25;
    }
  }
  return 0;
}`;
  Blockly.Arduino.setups_.sds011 = 'sds.begin(); \n  sds.setActiveReportingMode();';

  return '';
};


Blockly.Arduino.sds011_read = function(block) {
  var pmtype = block.getFieldValue('pmtype');
  var code = "sds011Read(" + pmtype + ")";
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};
