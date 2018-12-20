Blockly.Arduino["serial_init"] = function(block) {
  var dropdown_speed = block.getFieldValue("SPEED");
  var dropdown_pin = block.getFieldValue("pin");
  switch (dropdown_pin) {
    case "0":
      Blockly.Arduino.setups_["serial_begin"] = "Serial.begin(" + dropdown_speed + ");";
      break;
    case "19":
      Blockly.Arduino.setups_["serial_begin"] = "Serial1.begin(" + dropdown_speed + ");";
      break;
    case "17":
      Blockly.Arduino.setups_["serial_begin"] = "Serial2.begin(" + dropdown_speed + ");";
      break
    case "15":
      Blockly.Arduino.setups_["serial_begin"] = "Serial3.begin(" + dropdown_speed + ");";
      break
  }
  return ""
};
Blockly.Arduino["serial_read"] = function(block) {
  var code = "Serial.read()";
  return [code, Blockly.Arduino.ORDER_ATOMIC]
};
Blockly.Arduino["serial_line"] = function(block) {
  var code = '"\\n"';
  return [code, Blockly.Arduino.ORDER_ATOMIC]
};
Blockly.Arduino["serial_available"] = function(block) {
  var code = "Serial.available()";
  return [code, Blockly.Arduino.ORDER_ATOMIC]
};
Blockly.Arduino["serial_write"] = function(block) {
  var content = Blockly.Arduino.valueToCode(block, "CONTENT", Blockly.Arduino.ORDER_ATOMIC);
  return "Serial.print(" + content + ");\n"
};
Blockly.Arduino["serial_flush"] = function(block) {
  return "Serial.flush();\n"
};
Blockly.Arduino["soft_init"] = function(block) {
  var dropdown_pin1 = block.getFieldValue("PIN1");
  var dropdown_pin2 = block.getFieldValue("PIN2");
  var dropdown_speed = block.getFieldValue("SPEED");
  Blockly.Arduino.includes_["define_ss"] = "#include <SoftwareSerial.h>";
  Blockly.Arduino.definitions_["define_ss"] = "SoftwareSerial mySerial(" + dropdown_pin1 + "," + dropdown_pin2 + ");";
  Blockly.Arduino.setups_["setup_sserial"] = "mySerial.begin(" + dropdown_speed + ");";
  return ""
};
Blockly.Arduino["soft_read"] = function(block) {
  var code = "mySerial.read()";
  return [code, Blockly.Arduino.ORDER_ATOMIC]
};
Blockly.Arduino["soft_write"] = function(block) {
  var content = Blockly.Arduino.valueToCode(block, "CONTENT", Blockly.Arduino.ORDER_ATOMIC);
  return "mySerial.write(" + content + ");\n"
};
Blockly.Arduino["soft_available"] = function(block) {
  var code = "mySerial.available()";
  return [code, Blockly.Arduino.ORDER_ATOMIC]
};
Blockly.Arduino["servo_move"] = function(block) {
  var value_pin = Blockly.Arduino.valueToCode(block, "PIN", Blockly.Arduino.ORDER_ATOMIC);
  var value_degree = Blockly.Arduino.valueToCode(block, "DEGREE", Blockly.Arduino.ORDER_ATOMIC);
  Blockly.Arduino.includes_["define_servo"] = "#include <Servo.h>";
  Blockly.Arduino.definitions_["var_servo" + value_pin] = "Servo servo_" + value_pin + ";";
  Blockly.Arduino.setups_["setup_servo_" + value_pin] = "servo_" + value_pin + ".attach(" + value_pin + ");";
  return "servo_" + value_pin + ".write(" + value_degree + ");\n"
};
Blockly.Arduino["servo_rot_continue_param"] = function(block) {
  var value_pin = Blockly.Arduino.valueToCode(block, "PIN", Blockly.Arduino.ORDER_ATOMIC);
  var degree = Blockly.Arduino.valueToCode(block, "SPEED", Blockly.Arduino.ORDER_ATOMIC);
  var dropdown_etat = block.getFieldValue("ETAT");
  if (dropdown_etat == "FORWARD") var value_degree = 90 + parseInt(degree);
  if (dropdown_etat == "BACKWARD") var value_degree = 90 - parseInt(degree);
  Blockly.Arduino.includes_["define_servo"] = "#include <Servo.h>";
  Blockly.Arduino.definitions_["var_servo" + value_pin] = "Servo servo_" + value_pin + ";";
  Blockly.Arduino.setups_["setup_servo_" + value_pin] = "servo_" + value_pin + ".attach(" + value_pin + ");";
  return "servo_" + value_pin + ".write(" + value_degree + ");\n"
};
Blockly.Arduino["dcmotor_v1"] = function(block) {
  var dropdown_moteur = block.getFieldValue("MOTEUR");
  var dropdown_etat = block.getFieldValue("ETAT");
  var value_vitesse = Blockly.Arduino.valueToCode(block, "Vitesse");
  Blockly.Arduino.includes_["AFMotor.h"] = "#include <AFMotor.h>";
  Blockly.Arduino.definitions_["AF_DCMotor" + dropdown_moteur] = "AF_DCMotor motor_dc_" + dropdown_moteur + "(" + dropdown_moteur + ", MOTOR12_2KHZ);";
  return "motor_dc_" + dropdown_moteur + ".setSpeed(" + value_vitesse + ");\nmotor_dc_" + dropdown_moteur + ".run(" + dropdown_etat + ");\n"
};
Blockly.Arduino["base_setup_loop"] = function(block) {
  var branch = Blockly.Arduino.statementToCode(block, "DO");
  var loop = Blockly.Arduino.statementToCode(block, "LOOP");
  if (Blockly.Arduino.INFINITE_LOOP_TRAP) branch = Blockly.Arduino.INFINITE_LOOP_TRAP.replace(/%1/g, "'" + block.id + "'") + branch;
  var code = branch;
  var setup_key = Blockly.Arduino.variableDB_.getDistinctName("base_setup", Blockly.Variables.NAME_TYPE);
  Blockly.Arduino.setups_[setup_key] = code;
  return [loop, Blockly.Arduino.ORDER_ATOMIC]
};
Blockly.Arduino["base_loop"] = function(block) {
  function statementToCodeNoTab(block, name) {
    var targetBlock = block.getInputTargetBlock(name);
    var code = Blockly.Arduino.blockToCode(targetBlock);
    if (!goog.isString(code)) throw 'Expecting code from statement block "' + targetBlock.type + '".';
    return code
  }
  var loopBranch = statementToCodeNoTab(block, "LOOP");
  return loopBranch
};
Blockly.Arduino["base_define"] = function(block) {
  var branch = Blockly.Arduino.statementToCode(block, "DO");
  if (Blockly.Arduino.INFINITE_LOOP_TRAP) branch = Blockly.Arduino.INFINITE_LOOP_TRAP.replace(/%1/g, "'" + block.id + "'") + branch;
  var code = branch;
  var setup_key = Blockly.Arduino.variableDB_.getDistinctName("base_setup", Blockly.Variables.NAME_TYPE);
  Blockly.Arduino.definitions_[setup_key] = code;
  return ""
};
Blockly.Arduino["base_code"] = function(block) {
  return block.getFieldValue("TEXT") + "\n"
};
Blockly.Arduino["base_end"] = function(block) {
  return "while(true);\n"
};
Blockly.Arduino["base_begin"] = function(block) {
  return ""
};
Blockly.Arduino["millis"] = function(block) {
  var _u = block.getFieldValue("unite");
  switch (_u) {
    case "u":
      var code = "micros()";
      break;
    case "m":
      var code = "millis()";
      break;
    case "s":
      code = "1000*millis()";
      break
  }
  return [code, Blockly.Arduino.ORDER_ATOMIC]
};
Blockly.Arduino["base_delay"] = function(block) {
  var _u = block.getFieldValue("unite");
  var delay_time = Blockly.Arduino.valueToCode(block, "DELAY_TIME", Blockly.Arduino.ORDER_ATOMIC);
  switch (_u) {
    case "u":
      var code = "delayMicroseconds(" + delay_time + ");\n";
      break;
    case "m":
      var code = "delay(" + delay_time + ");\n";
      break;
    case "s":
      code = "delay(" + delay_time + "*1000);\n";
      break
  };
  return code
};
Blockly.Arduino["tempo_sans_delay"] = function(block) {
  var _u = block.getFieldValue("unite");
  var delay_time = Blockly.Arduino.valueToCode(block, "DELAY_TIME", Blockly.Arduino.ORDER_ATOMIC);
  var faire = Blockly.Arduino.statementToCode(block, "branche");
  var temps = "temps" + delay_time;
  Blockly.Arduino.definitions_["temporisation" + delay_time] = "long " + temps + "=0 ;";
  switch (_u) {
    case "u":
      var code = "if ((micros()-" + temps + ")>=" + delay_time + ") {\n  " + temps + "=micros();\n" + faire + "}\n";
      break;
    case "m":
      var code = "if ((millis()-" + temps + ")>=" + delay_time + ") {\n  " + temps + "=millis();\n" + faire + "}\n";
      break;
    case "s":
      code = "if ((millis()-" + temps + ")>=" + delay_time + "*1000) {\n  " + temps + "=millis();\n" + faire + "}\n";
      break
  };
  return code
};
Blockly.Arduino["inout_buildin_led"] = function(block) {
  var dropdown_stat = block.getFieldValue("STAT");
  Blockly.Arduino.setups_["setup_output_13"] = "pinMode(13, OUTPUT);";
  var code = "digitalWrite(13, " + dropdown_stat + ");\n";
  return code
};
Blockly.Arduino["inout_digital_write"] = function(block) {
  var dropdown_pin = Blockly.Arduino.valueToCode(block, "PIN", Blockly.Arduino.ORDER_ATOMIC);
  var dropdown_stat = Blockly.Arduino.valueToCode(block, "STAT", Blockly.Arduino.ORDER_ATOMIC);
  Blockly.Arduino.setups_["setup_output_" + dropdown_pin] = "pinMode(" + dropdown_pin + ", OUTPUT);";
  var code = "digitalWrite(" + dropdown_pin + ", " + dropdown_stat + ");\n";
  return code
};
Blockly.Arduino["inout_digital_write_validator"] = function(block) {
  var dropdown_pin = block.getFieldValue("PIN");
  var dropdown_stat = block.getFieldValue("STAT");
  Blockly.Arduino.setups_["setup_output_" + dropdown_pin] = "pinMode(" + dropdown_pin + ", OUTPUT);";
  var code = "digitalWrite(" + dropdown_pin + ", " + dropdown_stat + ");\n";
  return code
};
Blockly.Arduino["inout_digital_read"] = function(block) {
  var dropdown_pin = Blockly.Arduino.valueToCode(block, "PIN", Blockly.Arduino.ORDER_ATOMIC);
  Blockly.Arduino.setups_["setup_input_" + dropdown_pin] = "pinMode(" + dropdown_pin + ", INPUT_PULLUP);";
  var code = "digitalRead(" + dropdown_pin + ")";
  return [code, Blockly.Arduino.ORDER_ATOMIC]
};
Blockly.Arduino["digital_read"] = function(block) {
  var pull_up = block.getFieldValue('pullup') == 'TRUE';
  var dropdown_pin = Blockly.Arduino.valueToCode(block, "PIN", Blockly.Arduino.ORDER_ATOMIC);
  if (pull_up) {
    Blockly.Arduino.setups_["setup_input_" + dropdown_pin] = "pinMode(" + dropdown_pin + ", INPUT_PULLUP);"
  } else {
    Blockly.Arduino.setups_["setup_input_" + dropdown_pin] = "pinMode(" + dropdown_pin + ", INPUT);"
  };
  var code = "digitalRead(" + dropdown_pin + ")";
  return [code, Blockly.Arduino.ORDER_ATOMIC]
};
Blockly.Arduino["inout_digital_read_validator"] = function(block) {
  var dropdown_pin = block.getFieldValue("PIN");
  Blockly.Arduino.setups_["setup_input_" + dropdown_pin] = "pinMode(" + dropdown_pin + ", INPUT);";
  var code = "digitalRead(" + dropdown_pin + ")";
  return [code, Blockly.Arduino.ORDER_ATOMIC]
};
Blockly.Arduino["inout_analog_write"] = function(block) {
  var dropdown_pin = block.getFieldValue("broche");
  var value_num = Blockly.Arduino.valueToCode(block, "NUM", Blockly.Arduino.ORDER_ATOMIC);
  Blockly.Arduino.setups_["setup_output" + dropdown_pin] = "pinMode(" + dropdown_pin + ", OUTPUT);";
  var code = "analogWrite(" + dropdown_pin + ", " + value_num + ");\n";
  return code
};
Blockly.Arduino["inout_analog_write_validator"] = function(block) {
  var dropdown_pin = block.getFieldValue("PIN");
  var value_num = Blockly.Arduino.valueToCode(block, "NUM", Blockly.Arduino.ORDER_ATOMIC);
  Blockly.Arduino.setups_["setup_output" + dropdown_pin] = "pinMode(" + dropdown_pin + ", OUTPUT);";
  var code = "analogWrite(" + dropdown_pin + ", " + value_num + ");\n";
  return code
};
Blockly.Arduino["inout_analog_read"] = function(block) {
  var dropdown_pin = block.getFieldValue("broche");
  var code = "analogRead(" + dropdown_pin + ")";
  return [code, Blockly.Arduino.ORDER_ATOMIC]
};
Blockly.Arduino["inout_analog_read_validator"] = function(block) {
  var dropdown_pin = block.getFieldValue("PIN");
  Blockly.Arduino.setups_["setup_input_" + dropdown_pin] = "pinMode(" + dropdown_pin + ", INPUT);";
  var code = "analogRead(" + dropdown_pin + ")";
  return [code, Blockly.Arduino.ORDER_ATOMIC]
};
Blockly.Arduino["inout_onoff"] = function(block) {
  var code = block.getFieldValue("BOOL") == "HIGH" ? "HIGH" : "LOW";
  return [code, Blockly.Arduino.ORDER_ATOMIC]
};
Blockly.Arduino["inout_angle_maths"] = function(block) {
  var angle = block.getFieldValue("ANGLE");
  return [angle, Blockly.Arduino.ORDER_ATOMIC]
};
Blockly.Arduino["inout_pulsein"] = function(block) {
  var dropdown_pin = Blockly.Arduino.valueToCode(block, "PIN", Blockly.Arduino.ORDER_ATOMIC);
  var dropdown_stat = block.getFieldValue("STAT");
  Blockly.Arduino.setups_["setup_input_" + dropdown_pin] = "pinMode(" + dropdown_pin + ", INPUT);";
  var code = "pulseIn(" + dropdown_pin + "," + dropdown_stat + ")";
  return [code, Blockly.Arduino.ORDER_ATOMIC]
};
Blockly.Arduino["moteur_dc"] = function(block) {
  var dropdown_moteur = block.getFieldValue("MOTEUR");
  var dropdown_mot = parseInt(dropdown_moteur) + 5;
  var dropdown_etat = block.getFieldValue("ETAT");
  var value_vitesse = Blockly.Arduino.valueToCode(block, "Vitesse");
  Blockly.Arduino.setups_["setup_output_" + dropdown_moteur] = "pinMode(" + dropdown_moteur + ", OUTPUT);";
  Blockly.Arduino.setups_["setup_output_" + dropdown_mot] = "pinMode(" + dropdown_mot + ", OUTPUT);";
  return "analogWrite(" + dropdown_moteur + "," + value_vitesse + ");\ndigitalWrite(" + dropdown_mot + "," + dropdown_etat + ");\n"
};
Blockly.Arduino["moteur_dc_stop"] = function(block) {
  var dropdown_moteur = block.getFieldValue("MOTEUR");
  var dropdown_mot = parseInt(dropdown_moteur) + 5;
  Blockly.Arduino.setups_["setup_output_" + dropdown_moteur] = "pinMode(" + dropdown_moteur + ", OUTPUT);";
  Blockly.Arduino.setups_["setup_output_" + dropdown_mot] = "pinMode(" + dropdown_mot + ", OUTPUT);";
  return "analogWrite(" + dropdown_moteur + ",0);\ndigitalWrite(" + dropdown_mot + ",HIGH);\n"
};
Blockly.Arduino["ultrason"] = function(block) {
  var trig = Blockly.Arduino.valueToCode(block, "a", Blockly.Arduino.ORDER_ASSIGNMENT);
  var echo = Blockly.Arduino.valueToCode(block, "b", Blockly.Arduino.ORDER_ASSIGNMENT);
  var nb = parseInt(trig + echo);
  Blockly.Arduino.codeFunctions_["ultrason_distance_" + nb] = "float distance_" + nb + " () {\n  digitalWrite(" + trig + ",HIGH);\n  delayMicroseconds(10);\n  digitalWrite(" + trig + ",LOW);\n  return pulseIn(" + echo + ",HIGH)/58;\n}";
  Blockly.Arduino.setups_["ultrason_distance_" + nb] = "pinMode(" + trig + ",OUTPUT);\n  digitalWrite(" + trig + ",LOW);\n  pinMode(" + echo + ",INPUT);";
  return ""
};
Blockly.Arduino["ultrason_distance"] = function(block) {
  var nb = Blockly.Arduino.valueToCode(block, "nb", Blockly.Arduino.ORDER_ASSIGNMENT);
  var code = "distance_" + nb + "()";
  return [code, Blockly.Arduino.ORDER_ATOMIC]
};
Blockly.Arduino["lp2i_mp3_init"] = function(block) {
  var volume = Blockly.Arduino.valueToCode(block, "Volume", Blockly.Arduino.ORDER_ATOMIC);
  Blockly.Arduino.codeFunctions_["fonction_mp3"] = "void exe_cmd(byte CMD, byte Par1, byte Par2) {\n  word check=-(0xFF + 0x06 + CMD + 0x00 + Par1 + Par2);\n  byte Command[10]={0x7E,0xFF,0x06,CMD,0x00,Par1,Par2,highByte(check),lowByte(check),0xEF};\n  for (int i=0; i<10; i++) {\n    Serial.write( Command[i]);\n  };\n}";
  Blockly.Arduino.setups_["setup_mp3"] = "Serial.begin(9600);\n  delay(1000);\n  exe_cmd(0x3F,0,0);\n  delay(500);\n  exe_cmd(0x06,0," + volume + ");\n  delay(500);\n  exe_cmd(0x11,0,1);\n  delay(500);";
  return ""
};
Blockly.Arduino["lp2i_mp3_volume"] = function(block) {
  var volume = Blockly.Arduino.valueToCode(block, "Volume", Blockly.Arduino.ORDER_ATOMIC);
  return "exe_cmd(0x06,0," + volume + ");\ndelay(500);\n"
};
Blockly.Arduino["lp2i_mp3_next"] = function(block) {
  return "exe_cmd(0x01,0,1);\ndelay(500);\n"
};
Blockly.Arduino["lp2i_mp3_prev"] = function(block) {
  return "exe_cmd(0x02,0,1);\ndelay(500);\n"
};
Blockly.Arduino["lp2i_mp3_pause"] = function(block) {
  return "exe_cmd(0x0E,0,0);\ndelay(500);\n"
};
Blockly.Arduino["lp2i_mp3_play"] = function(block) {
  return "exe_cmd(0x0D,0,1);\ndelay(500);\n"
};
Blockly.Arduino["tone"] = function(block) {
  var value_pin = Blockly.Arduino.valueToCode(block, "PIN", Blockly.Arduino.ORDER_ATOMIC);
  var value_num = Blockly.Arduino.valueToCode(block, "NUM", Blockly.Arduino.ORDER_ATOMIC);
  var value_tps = Blockly.Arduino.valueToCode(block, "TPS", Blockly.Arduino.ORDER_ATOMIC);
  Blockly.Arduino.setups_["setup_output" + value_pin] = "pinMode(" + value_pin + ", OUTPUT);";
  return "tone(" + value_pin + "," + value_num + "," + value_tps + ");\ndelay(" + value_tps + ");\n"
};
Blockly.Arduino["beep"] = function(block) {
  var value_pin = Blockly.Arduino.valueToCode(block, "PIN", Blockly.Arduino.ORDER_ATOMIC);
  Blockly.Arduino.setups_["setup_output" + value_pin] = "pinMode(" + value_pin + ", OUTPUT);";
  return "tone(" + value_pin + ",440,1000);\ndelay(1000);\n"
};
Blockly.Arduino["notone"] = function(block) {
  var value_pin = Blockly.Arduino.valueToCode(block, "PIN", Blockly.Arduino.ORDER_ATOMIC);
  Blockly.Arduino.setups_["setup_output" + value_pin] = "pinMode(" + value_pin + ", OUTPUT);";
  return "noTone(" + value_pin + ");\n"
};
Blockly.Arduino["matrice8x8_symbole"] = function(block) {
  var vname = Blockly.Arduino.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var l1 = block.getFieldValue("L1");
  var l2 = block.getFieldValue("L2");
  var l3 = block.getFieldValue("L3");
  var l4 = block.getFieldValue("L4");
  var l5 = block.getFieldValue("L5");
  var l6 = block.getFieldValue("L6");
  var l7 = block.getFieldValue("L7");
  var l8 = block.getFieldValue("L8");
  Blockly.Arduino.variables_[vname] = "byte " + vname + "[]={\n B" + l1 + ",\n B" + l2 + ",\n B" + l3 + ",\n B" + l4 + ",\n B" + l5 + ",\n B" + l6 + ",\n B" + l7 + ",\n B" + l8 + "\n" + "};";
  return ""
};
Blockly.Arduino["matrice8x8_init"] = function(block) {
  var din = Blockly.Arduino.valueToCode(block, "DIN", Blockly.Arduino.ORDER_ASSIGNMENT);
  var clk = Blockly.Arduino.valueToCode(block, "CLK", Blockly.Arduino.ORDER_ASSIGNMENT);
  var cs = Blockly.Arduino.valueToCode(block, "CS", Blockly.Arduino.ORDER_ASSIGNMENT);
  Blockly.Arduino.includes_["matrice8x8init"] = '#include <LedControl.h>';
  Blockly.Arduino.definitions_["matrice8x8init"] = "LedControl lc=LedControl(" + din + "," + clk + "," + cs + ",1);";
  Blockly.Arduino.codeFunctions_["matrice8x8init"] = "void afficher(byte s[]) {\n  for (int i=0; i<8; i++) {\n    lc.setRow(0,i,s[i]);\n  };\n}";
  Blockly.Arduino.setups_["matrice8x8"] = "lc.shutdown(0,false);\n  lc.setIntensity(0,3);\n  lc.clearDisplay(0);";
  return ""
};
Blockly.Arduino["matrice8x8_aff"] = function(block) {
  var varname = Blockly.Arduino.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  return "afficher(" + varname + ");\n"
};
Blockly.Arduino["matrice8x8_efface"] = function(block) {
  return "lc.clearDisplay(0);\n"
};
Blockly.Arduino["matrice8x8_del"] = function(block) {
  var etat = Blockly.Arduino.valueToCode(block, "STATE", Blockly.Arduino.ORDER_ASSIGNMENT);
  var ligne = Blockly.Arduino.valueToCode(block, "line", Blockly.Arduino.ORDER_ASSIGNMENT);
  var colonne = Blockly.Arduino.valueToCode(block, "col", Blockly.Arduino.ORDER_ASSIGNMENT);
  return "lc.setLed(0," + ligne + "," + colonne + "," + etat + ");\n"
};
Blockly.Arduino["binaire"] = function(block) {
  var code = block.getFieldValue("bin");
  return [code, Blockly.Arduino.ORDER_ATOMIC]
};
Blockly.Arduino["LCD_Keypad_Shield_DFR_09"] = function(block) {
  var text1 = Blockly.Arduino.valueToCode(block, "TEXT1", Blockly.Arduino.ORDER_UNARY_POSTFIX);
  var text2 = Blockly.Arduino.valueToCode(block, "TEXT2", Blockly.Arduino.ORDER_UNARY_POSTFIX);
  return "lcd.setCursor(0,0);\nlcd.print(" + text1 + ");\nlcd.setCursor(0,1);\nlcd.print(" + text2 + ");\n"
};
Blockly.Arduino["LCD_Keypad_Shield_DFR_09_lc"] = function(block) {
  var value_num_ligne = block.getFieldValue("ligne");
  var value_num_colonne = block.getFieldValue("colonne");
  var text4 = Blockly.Arduino.valueToCode(block, "TEXT4", Blockly.Arduino.ORDER_UNARY_POSTFIX);
  return "lcd.setCursor(" + value_num_colonne + "," + value_num_ligne + ");\nlcd.print(" + text4 + ");\n"
};
Blockly.Arduino["LCD_Keypad_Shield_DFR_09_RAZ"] = function(block) {
  return "lcd.clear();\n"
};
Blockly.Arduino["lm35"] = function(block) {
  var pin = block.getFieldValue("broche");
  Blockly.Arduino.setups_["lm35"] = "analogReference(INTERNAL);";
  var code = "analogRead(" + pin + ")/11";
  return [code, Blockly.Arduino.ORDER_ATOMIC]
};
Blockly.Arduino["moteur_action"] = function(block) {
  var dropdown_menu = block.getFieldValue("menu");
  var value_speed = block.getFieldValue("speed");
  Blockly.Arduino.includes_["AFMotor.h"] = "#include <AFMotor.h>";
  Blockly.Arduino.definitions_["AF_DCMotor_1"] = "AF_DCMotor motor_dc_1(1, MOTOR12_2KHZ);";
  Blockly.Arduino.definitions_["AF_DCMotor_2"] = "AF_DCMotor motor_dc_2(2, MOTOR12_2KHZ);";
  switch (dropdown_menu) {
    case "a":
      var code = "motor_dc_1.setSpeed(2*" + value_speed + ");\nmotor_dc_1.run(FORWARD);\nmotor_dc_2.setSpeed(2*" + value_speed + ");\nmotor_dc_2.run(FORWARD);\n";
      break;
    case "d":
      var code = "motor_dc_1.setSpeed(2*" + value_speed + ");\nmotor_dc_1.run(FORWARD);\nmotor_dc_2.setSpeed(2*" + value_speed + ");\nmotor_dc_2.run(BACKWARD);\n";
      break;
    case "g":
      code = "motor_dc_1.setSpeed(2*" + value_speed + ");\nmotor_dc_1.run(BACKWARD);\nmotor_dc_2.setSpeed(2*" + value_speed + ");\nmotor_dc_2.run(FORWARD);\n";
      break
  }
  return code
};
Blockly.Arduino["moteur_stop"] = function(block) {
  return "motor_dc_1.run(RELEASE);\nmotor_dc_2.run(RELEASE);\n"
};
Blockly.Arduino["bluetooth_a"] = function(block) {
  var value_data_s = Blockly.Arduino.valueToCode(block, "data_s", Blockly.Arduino.ORDER_NONE);
  Blockly.Arduino.setups_["BLUETOOTH"] = "Serial.begin(9600);";
  return "if (Serial.available() > 0) {\n  Serial.write(" + value_data_s + ");\n}\n"
};
Blockly.Arduino["bluetooth_b"] = function(block) {
  var n = 0;
  var argument = Blockly.Arduino.valueToCode(block, "CASE" + n, Blockly.Arduino.ORDER_NONE);
  var branch = Blockly.Arduino.statementToCode(block, "DO" + n);
  Blockly.Arduino.setups_["BLUETOOTH"] = "Serial.begin(9600);";
  var code = "if (Serial.available() > 0) {\n  char dataR=Serial.read();\n  if (dataR == " + argument + ") {\n  " + branch + "  }\n";
  for (n = 1; n <= block.casebreakCount_; n++) {
    argument = Blockly.Arduino.valueToCode(block, "CASE" + n, Blockly.Arduino.ORDER_NONE);
    branch = Blockly.Arduino.statementToCode(block, "DO" + n);
    code += "  if (dataR == " + argument + ") {\n  " + branch + "  }\n"
  }
  code += "}\n"
  return code
};
Blockly.Arduino["blink"] = function(block) {
  var dropdown_speed = block.getFieldValue("speed");
  Blockly.Arduino.setups_["setup_output_13"] = "pinMode(13, OUTPUT);";
  return "digitalWrite(13, HIGH);\ndelay(" + dropdown_speed + ");\ndigitalWrite(13, LOW);\ndelay(" + dropdown_speed + ");\n"
};
Blockly.Arduino["dagu_rs027"] = function(block) {
  var dropdown_moteur = block.getFieldValue("MOTEUR");
  var dropdown_mot = parseInt(dropdown_moteur) - 2;
  var dropdown_etat = block.getFieldValue("ETAT");
  var value_vitesse = Blockly.Arduino.valueToCode(block, "Vitesse");
  Blockly.Arduino.setups_["setup_output_" + dropdown_moteur] = "pinMode(" + dropdown_moteur + ", OUTPUT);";
  Blockly.Arduino.setups_["setup_output_" + dropdown_mot] = "pinMode(" + dropdown_mot + ", OUTPUT);";
  return "analogWrite(" + dropdown_moteur + "," + value_vitesse + ");\ndigitalWrite(" + dropdown_mot + "," + dropdown_etat + ");\n"
};
Blockly.Arduino["lcd"] = function(block) {
  var v_rs = Blockly.Arduino.valueToCode(block, "rs", Blockly.Arduino.ORDER_ASSIGNMENT);
  var v_d4 = Blockly.Arduino.valueToCode(block, "d4", Blockly.Arduino.ORDER_ASSIGNMENT);
  var v_d5 = Blockly.Arduino.valueToCode(block, "d5", Blockly.Arduino.ORDER_ASSIGNMENT);
  var v_d6 = Blockly.Arduino.valueToCode(block, "d6", Blockly.Arduino.ORDER_ASSIGNMENT);
  var v_d7 = Blockly.Arduino.valueToCode(block, "d7", Blockly.Arduino.ORDER_ASSIGNMENT);
  var v_en = Blockly.Arduino.valueToCode(block, "en", Blockly.Arduino.ORDER_ASSIGNMENT);
  Blockly.Arduino.includes_["define_LiquidCrystal"] = "#include <LiquidCrystal.h>";
  Blockly.Arduino.definitions_["var_LiquidCrystal lcd"] = "LiquidCrystal lcd(" + v_rs + "," + v_en + "," + v_d4 + "," + v_d5 + "," + v_d6 + "," + v_d7 + ");";
  Blockly.Arduino.setups_["setup_lcd"] = "lcd.begin(16,2);\n  lcd.clear();";
  return ''
};
Blockly.Arduino["inout_bp"] = function(block) {
  var dropdown_pin = Blockly.Arduino.valueToCode(block, "PIN", Blockly.Arduino.ORDER_ATOMIC);
  Blockly.Arduino.setups_["setup_input_" + dropdown_pin] = "pinMode(" + dropdown_pin + ", INPUT_PULLUP);";
  var code = "digitalRead(" + dropdown_pin + ") == LOW";
  return [code, Blockly.Arduino.ORDER_ATOMIC]
};
Blockly.Arduino["digital_write"] = function(block) {
  var dropdown_pin = Blockly.Arduino.valueToCode(block, "PIN", Blockly.Arduino.ORDER_ATOMIC);
  var dropdown_stat = block.getFieldValue("STAT");
  Blockly.Arduino.setups_["setup_output_" + dropdown_pin] = "pinMode(" + dropdown_pin + ", OUTPUT);";
  return "digitalWrite(" + dropdown_pin + ", " + dropdown_stat + ");\n";
};
Blockly.Arduino["toggle"] = function(block) {
  var dropdown_pin = Blockly.Arduino.valueToCode(block, "PIN", Blockly.Arduino.ORDER_ATOMIC);
  Blockly.Arduino.definitions_["toggle" + dropdown_pin] = "boolean etat_" + dropdown_pin + "=LOW;";
  Blockly.Arduino.setups_["setup_output_" + dropdown_pin] = "pinMode(" + dropdown_pin + ", OUTPUT);";
  return "digitalWrite(" + dropdown_pin + ", etat_" + dropdown_pin + ");\netat_" + dropdown_pin + "=!etat_" + dropdown_pin + ";\n";
};
Blockly.Arduino["dht11"] = function(block) {
  var dropdown_pin = Blockly.Arduino.valueToCode(block, "PIN", Blockly.Arduino.ORDER_ATOMIC);
  var choice = block.getFieldValue("choix");
  Blockly.Arduino.includes_["dht.h"] = '#include <DHT.h>';
  Blockly.Arduino.definitions_["dht"] = "DHT dht(" + dropdown_pin + ", DHT11);";
  Blockly.Arduino.setups_["dht"] = "dht.begin();";
  switch (choice) {
    case "h":
      var code = "dht.readHumidity()";
      break;
    case "t":
      var code = "dht.readTemperature()";
      break;
  }
  return [code, Blockly.Arduino.ORDER_ATOMIC]
};
Blockly.Arduino["suiveur_ligne"] = function(block) {
  var dropdown_pin = Blockly.Arduino.valueToCode(block, "PIN", Blockly.Arduino.ORDER_ATOMIC);
  Blockly.Arduino.setups_["setup_input_" + dropdown_pin] = "pinMode(" + dropdown_pin + ", INPUT);";
  var code = "digitalRead(" + dropdown_pin + ") == HIGH";
  return [code, Blockly.Arduino.ORDER_ATOMIC]
};
Blockly.Arduino["light_sensor"] = function(block) {
  var dropdown_pin = block.getFieldValue("broche");
  var code = "analogRead(" + dropdown_pin + ")/4";
  return [code, Blockly.Arduino.ORDER_ATOMIC]
};
Blockly.Arduino["potentiometre"] = function(block) {
  var dropdown_pin = block.getFieldValue("broche");
  var code = "analogRead(" + dropdown_pin + ")/4";
  return [code, Blockly.Arduino.ORDER_ATOMIC]
};
Blockly.Arduino["moteur3v"] = function(block) {
  var dropdown_pin = block.getFieldValue("pin");
  var value_num = Blockly.Arduino.valueToCode(block, "speed", Blockly.Arduino.ORDER_ATOMIC);
  Blockly.Arduino.setups_["setup_output" + dropdown_pin] = "pinMode(" + dropdown_pin + ", OUTPUT);";
  return "analogWrite(" + dropdown_pin + ", " + value_num + ");\n";
};
Blockly.Arduino["bargraphe"] = function(block) {
  var _clock = Blockly.Arduino.valueToCode(block, 'clk', Blockly.Arduino.ORDER_ATOMIC);
  var _data = Blockly.Arduino.valueToCode(block, 'data', Blockly.Arduino.ORDER_ATOMIC);
  Blockly.Arduino.definitions_["ledbar"] = "unsigned char _state[]={0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00};";
  Blockly.Arduino.codeFunctions_["ledbar"] = "void sendData(unsigned int data) {\n  for (unsigned char i=0; i < 16; i++){\n    unsigned int state=(data&0x8000) ? HIGH : LOW;\n    digitalWrite(" + _data + ", state);\n    state=digitalRead(" + _clock + ") ? LOW : HIGH;\n    digitalWrite(" + _clock + ", state);\n    data <<= 1;\n  }\n}\nvoid setData(unsigned char _state[]) {\n  sendData(0x00);\n  for (unsigned char i=0; i<10; i++) sendData(_state[10-i-1]);\n  sendData(0x00);\n  sendData(0x00);\n  digitalWrite(" + _data + ", LOW);\n  delayMicroseconds(10);\n  for (unsigned char i=0; i<4; i++){\n    digitalWrite(" + _data + ", HIGH);\n    digitalWrite(" + _data + ", LOW);\n  }\n}\nvoid SetLevel(float level) {\n  level=max(0, min(10, level));\n  level *= 8;\n  for (byte i=0; i<10; i++) {\n    _state[i]=(level>8) ? ~0 : (level>0) ? ~(~0 << byte(level)) : 0;\n    level -= 8;\n  };\n  setData(_state);\n}";
  Blockly.Arduino.setups_["ledbar"] = "pinMode(" + _clock + ", OUTPUT);\n  pinMode(" + _data + ", OUTPUT);";
  return ""
};
Blockly.Arduino["bargraphe_allume"] = function(block) {
  var level = Blockly.Arduino.valueToCode(block, 'del', Blockly.Arduino.ORDER_ATOMI);
  return "SetLevel(" + level + ");\n"
};
Blockly.Arduino["lcd_i2c"] = function(block) {
  var fond_couleur = block.getFieldValue("fond");
  Blockly.Arduino.includes_["rgb_lcd"] = '#include <Wire.h>\n#include <rgb_lcd.h>';
  Blockly.Arduino.definitions_["rgb_lcd"] = "rgb_lcd lcd;";
  switch (fond_couleur) {
    case "bleu":
      var code = "  lcd.setRGB(0,0,255);";
      break;
    case "jaune":
      var code = "  lcd.setRGB(255,255,0);";
      break;
    case "rouge":
      code = "  lcd.setRGB(255,0,0);";
      break;
    case "vert":
      var code = "  lcd.setRGB(0,255,0);";
      break
  };
  Blockly.Arduino.setups_["rgb_lcd"] = "lcd.begin(16,2);\n  lcd.clear();\n" + code;
  return "";
};
Blockly.Arduino["lcd_symbole"] = function(block) {
  var vname = block.getFieldValue("c_char");
  var l1 = block.getFieldValue("L1");
  var l2 = block.getFieldValue("L2");
  var l3 = block.getFieldValue("L3");
  var l4 = block.getFieldValue("L4");
  var l5 = block.getFieldValue("L5");
  var l6 = block.getFieldValue("L6");
  var l7 = block.getFieldValue("L7");
  var l8 = block.getFieldValue("L8");
  Blockly.Arduino.variables_["char_" + vname] = "byte char_" + vname + "[]={\n B" + l1 + ",\n B" + l2 + ",\n B" + l3 + ",\n B" + l4 + ",\n B" + l5 + ",\n B" + l6 + ",\n B" + l7 + ",\n B" + l8 + "\n" + "};";
  Blockly.Arduino.setups_["char_" + vname] = "lcd.createChar(" + vname + ",char_" + vname + ");";
  return ""
};
Blockly.Arduino["lcd_aff_symbole"] = function(block) {
  var value_num_ligne = block.getFieldValue("ligne");
  var value_num_colonne = block.getFieldValue("colonne");
  var variable = block.getFieldValue("c_char");
  return "lcd.setCursor(" + value_num_colonne + "," + value_num_ligne + ");\nlcd.write(" + variable + ");\n"
};
Blockly.Arduino["inout_attachInterrupt"] = function(block) {
  var dropdown_pin = block.getFieldValue('PIN');
  var dropdown_mode = block.getFieldValue('mode');
  var funcName = 'interrupt_' + dropdown_pin;
  Blockly.Arduino.setups_['setup_Interrupt_' + dropdown_pin] = 'pinMode(' + dropdown_pin + ', INPUT);\n  attachInterrupt(' + dropdown_pin + ',' + funcName + ',' + dropdown_mode + ');';
  var branch = Blockly.Arduino.statementToCode(block, 'DO');
  Blockly.Arduino.codeFunctions_[funcName] = 'void ' + funcName + '() {\n' + branch + '}';
  return "";
};
Blockly.Arduino["inout_detachInterrupt"] = function(block) {
  var dropdown_pin = block.getFieldValue('PIN');
  return 'detachInterrupt(' + dropdown_pin + ');\n';
};
Blockly.Arduino['block_pir'] = function(block) {
  var value_v1 = Blockly.Arduino.valueToCode(block, 'NAME', Blockly.Arduino.ORDER_ASSIGNMENT);
  Blockly.Arduino.setups_["setup_output_" + value_v1] = 'pinMode(' + value_v1 + ', INPUT);';
  var code = 'digitalRead(' + value_v1 + ')';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};
Blockly.Arduino['block_feu'] = function(block) {
  var value_v1 = Blockly.Arduino.valueToCode(block, 'FEU', Blockly.Arduino.ORDER_ASSIGNMENT);
  Blockly.Arduino.setups_["setup_output_" + value_v1] = 'pinMode(' + value_v1 + ', INPUT);';
  var code = 'digitalRead(' + value_v1 + ')';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};
Blockly.Arduino['block_anticollision'] = function(block) {
  var value_v1 = Blockly.Arduino.valueToCode(block, 'COLLISION', Blockly.Arduino.ORDER_ASSIGNMENT);
  Blockly.Arduino.setups_["setup_output_" + value_v1] = 'pinMode(' + value_v1 + ', INPUT);';
  var code = 'digitalRead(' + value_v1 + ')';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};
Blockly.Arduino['block_sensitif'] = function(block) {
  var value_v1 = Blockly.Arduino.valueToCode(block, 'SENSITIF', Blockly.Arduino.ORDER_ASSIGNMENT);
  Blockly.Arduino.setups_["setup_output_" + value_v1] = 'pinMode(' + value_v1 + ', INPUT);';
  var code = 'digitalRead(' + value_v1 + ')';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};
Blockly.Arduino['base_code_entree'] = function(block) {
  var code = block.getFieldValue("TEXT");
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};
Blockly.Arduino['esp8266_init'] = function(block) {
  var nom = block.getFieldValue("SSID");
  var cle = block.getFieldValue("KEY");
  Blockly.Arduino.codeFunctions_["esp8266"] = 'String esp8266Data(String command) {\n  String response_esp = "";\n  Serial.println(command);\n  long int time_esp = millis();\n  while ((time_esp + 1000) > millis()) {\n    while (Serial.available()) {\n      char c_esp = Serial.read();\n      response_esp += c_esp;\n    }\n  }\n  return response_esp ;\n}';
  Blockly.Arduino.setups_["esp8266"] = 'Serial.begin(115200);\n  esp8266Data("AT+RST");\n  esp8266Data("AT+CWMODE=1");\n  esp8266Data("AT+CWJAP=\\"' + nom + '\\",\\"' + cle + '\\"");\n  while(!Serial.find("OK")) ;\n  esp8266Data("AT+CIPMUX=0");\n  esp8266Data("AT+CIPSERVER=1,80");';
  return "";
};
Blockly.Arduino['esp8266_send'] = function(block) {
  var _message = Blockly.Arduino.valueToCode(block, 'message', Blockly.Arduino.ORDER_ATOMI) || '"ok"';
  return 'if (Serial.available() > 0) {\n  if (Serial.find(\"+IPD,\")) {\n    delay(1000);\n    String _mess = ' + _message + ';\n    String send_mess = "AT+CIPSEND=" + _mess.length() + "\\r\\n";\n    esp8266Data(send_mess);\n    esp8266Data(_mess);\n    esp8266Data(\"AT+CIPCLOSE\");\n  }\n}'
};
Blockly.Arduino['esp8266_receive'] = function(block) {
  var n = 0;
  var argument = Blockly.Arduino.valueToCode(block, "CASE" + n, Blockly.Arduino.ORDER_NONE) || "false";
  var branch = Blockly.Arduino.statementToCode(block, "DO" + n);
  var code = "if (Serial.available() > 0) {\n  if (Serial.find(\"+IPD,\")) {\n    delay(1000);\n    esp8266Data(\"AT+CIPSEND=23\\r\\n\");\n    esp8266Data(\"Carte Arduino connectée\");\n    esp8266Data(\"AT+CIPCLOSE\");\n  }\n}";
  for (n = 1; n <= block.casebreakCount_; n++) {
    argument = Blockly.Arduino.valueToCode(block, "CASE" + n, Blockly.Arduino.ORDER_NONE) || "false";
    branch = Blockly.Arduino.statementToCode(block, "DO" + n);
    code += "  if (dataR == " + argument + ") {\n  " + branch + "  }\n"
  }
  return code
};
Blockly.Arduino["cap615"] = function(block) {
  var dropdown_pin = block.getFieldValue("broche");
  var code = "(1023-analogRead(" + dropdown_pin + "))/8";
  return [code, Blockly.Arduino.ORDER_ATOMIC]
};
Blockly.Arduino["cap661"] = function(block) {
  var dropdown_pin = block.getFieldValue("broche");
  Blockly.Arduino.variables_["tick_codeuse"] = "unsigned int tick_codeuse = 0;";
  Blockly.Arduino.setups_['setup_Interrupt_' + dropdown_pin] = 'pinMode(' + dropdown_pin + ', INPUT);\n  attachInterrupt(' + dropdown_pin + ',codeuse,CHANGE);';
  Blockly.Arduino.codeFunctions_["codeuse"] = 'void codeuse(){\n  tick_codeuse++;\n}';
  var code = "tick_codeuse";
  return [code, Blockly.Arduino.ORDER_ATOMIC]
};
Blockly.Arduino['eeprom_write'] = function(block) {
  var adresse = Blockly.Arduino.valueToCode(block, 'adr', Blockly.Arduino.ORDER_ATOMIC);
  var valeur = Blockly.Arduino.valueToCode(block, 'val', Blockly.Arduino.ORDER_ATOMIC);
  Blockly.Arduino.includes_["eeprom"] = '#include <EEPROM.h>';
  return 'EEPROM.write(' + adresse + ',' + valeur + ');\n';
};
Blockly.Arduino['eeprom_read'] = function(block) {
  var adresse = Blockly.Arduino.valueToCode(block, 'adr', Blockly.Arduino.ORDER_ATOMIC);
  Blockly.Arduino.includes_["eeprom"] = '#include <EEPROM.h>';
  return 'EEPROM.read(' + adresse + ')';
};
Blockly.Arduino["m_pap"] = function(block) {
  var vitesse = Blockly.Arduino.valueToCode(block, "vit", Blockly.Arduino.ORDER_ASSIGNMENT);
  var nb_pas = Blockly.Arduino.valueToCode(block, "pas", Blockly.Arduino.ORDER_ASSIGNMENT);
  var phase1 = Blockly.Arduino.valueToCode(block, "ph1", Blockly.Arduino.ORDER_ASSIGNMENT);
  var phase2 = Blockly.Arduino.valueToCode(block, "ph2", Blockly.Arduino.ORDER_ASSIGNMENT);
  var phase3 = Blockly.Arduino.valueToCode(block, "ph3", Blockly.Arduino.ORDER_ASSIGNMENT);
  var phase4 = Blockly.Arduino.valueToCode(block, "ph4", Blockly.Arduino.ORDER_ASSIGNMENT);
  Blockly.Arduino.includes_["stepper"] = "#include <Stepper.h>";
  Blockly.Arduino.definitions_["stepper"] = "Stepper moteurPAP(" + nb_pas + "," + phase1 + "," + phase2 + "," + phase3 + "," + phase4 + ");";
  Blockly.Arduino.setups_["stepper"] = "moteurPAP.setSpeed(" + vitesse + ");";
  return ''
};
Blockly.Arduino['m_pap_step'] = function(block) {
  var m_step = Blockly.Arduino.valueToCode(block, 'step', Blockly.Arduino.ORDER_ASSIGNMENT);
  return 'moteurPAP.step(' + m_step + ');\n';
};
Blockly.Arduino["grove_ldr"] = function(block) {
  var dropdown_pin = block.getFieldValue("broche");
  var code = "analogRead(" + dropdown_pin + ")/7.9";
  return [code, Blockly.Arduino.ORDER_ATOMIC]
};



Blockly.Arduino['sds011'] = function(block) {
  var rx = block.getFieldValue('RX');
  var tx = block.getFieldValue('TX');
  Blockly.Arduino.includes_['sds011'] = '#include "SdsDustSensor.h"';
  //Blockly.Arduino.variables_['sds011'] = 'placer ici le code de mes variables';
  Blockly.Arduino.definitions_['sds011'] = 'SdsDustSensor sds(' + rx + ', ' + tx + ');';
  Blockly.Arduino.userFunctions_['sds011'] = `float sds011Read(int type)
{
  sds.queryPm();
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
  Blockly.Arduino.setups_['sds011'] = 'sds.begin(); \n  sds.setActiveReportingMode();';

  return '';
};


Blockly.Arduino['sds011_read'] = function(block) {
  var pmtype = block.getFieldValue('pmtype');
  var code = "sds011Read(" + pmtype + ")";
  return [code, Blockly.Arduino.ORDER_ATOMIC]
};
