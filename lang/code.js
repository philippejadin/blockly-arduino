'use strict';

var Code = {};

Code.LANGUAGE_NAME = {
		  //'en': 'English',
		  //'es': 'Español',
		  'fr': 'Français'
		};
Code.LANGUAGE_RTL = ['ar', 'fa', 'he'];

Code.getLang = function() {
  var lang = BlocklyDuino.getStringParamFromUrl('lang', '');
  if (Code.LANGUAGE_NAME[lang] === undefined) {
    lang = 'fr';
  }
  return lang;
};

Code.isRtl = function() {
  return Code.LANGUAGE_RTL.indexOf(Code.LANG) != -1;
};

Code.LANG = Code.getLang();

Code.initLanguage = function() {
  var rtl = Code.isRtl();
  $("html").attr('dir', rtl ? 'rtl' : 'ltr');
  $("html").attr('lang', Code.LANG);
  var languages = [];
  for (var lang in Code.LANGUAGE_NAME) {
    languages.push([Code.LANGUAGE_NAME[lang], lang]);
  }
  var comp = function(a, b) {
    if (a[0] > b[0]) return 1;
    if (a[0] < b[0]) return -1;
    return 0;
  };
  languages.sort(comp);
  var languageMenu = $('#languageMenu');
  languageMenu.empty();
  for (var i = 0; i < languages.length; i++) {
    var tuple = languages[i];
    var lang = tuple[tuple.length - 1];
    var option = new Option(tuple[0], lang);
    if (lang == Code.LANG) {
      option.selected = true;
    }
    languageMenu.append(option);
  }
  $('#title').text(MSG['title']);
  $('#span_lib').text(MSG['span_lib']);
  $('#span_about').text(MSG['span_about']);
  $('#span_example').text(MSG['span_example']);
  $('#aboutModalLabel').text(MSG['aboutModalLabel']);
  $('#aboutBody').html(MSG['aboutBody']);
  $('#span_configbloc').text(MSG['span_configbloc']);
  $('#labelArduinoCard').text(MSG['labelArduinoCard']);
  $('#span_delete').text(MSG['span_delete']);
  $('#span_saveXML').text(MSG['span_saveXML']);
  $('#span_fakeload').text(MSG['span_fakeload']);
  $('#a_blocks').text(MSG['a_blocks']);
  $('#a_arduino').text(MSG['a_arduino']);
  $('#a_term').text(MSG['a_term']);
  $('#a_factory').text(MSG['a_factory']);
  $('#span_connect_serial').text(MSG['span_connect_serial']);
  $('#configModalLabel').text(MSG['configModalLabel']);
  $('#span_select_all').text(MSG['span_select_all']);
  $('#btn_close_config').text(MSG['btn_close']);
  $('#btn_valid_config').text(MSG['btn_valid']);
  $('#btn_close_msg').text(MSG['btn_close']);
  $('#btn_valid_msg').text(MSG['btn_valid']);
  $('#exampleModalLabel').text(MSG['exampleModalLabel']); 
  $('#labelToolboxDefinition').text(MSG['labelToolboxDefinition']); 
  $('#configModalGlobalLabel').text(MSG['configModalGlobalLabel']);
  $('#titre').text(MSG['titre']);
  $('#survol').text(MSG['survol']);
  $('#configGlobalLabel').text(MSG['configGlobalLabel']);
  $('#btn_closeConfigGlobale').text(MSG['btn_close']);
  $('#btn_validConfigGlobale').text(MSG['btn_valid']);
  $('#span_languageMenu').text(MSG['span_languageMenu']);
  $('#btn_variable').text(MSG['btn_variable']);
  $('#variableModalLabel').text(MSG['variableModalLabel']);
  $('#variablebody').text(MSG['variablebody']);
  $('#btn_print').attr('title', MSG['btn_print']);
  $('#btn_configGlobal').attr('title', MSG['span_configGlobal']);
  $('#btn_config').attr('title', MSG['span_config']);
  $('#btn_undo').attr('title', MSG['span_undo']);
  $('#btn_redo').attr('title', MSG['span_redo']);
  $('#btn_closeCode').text(MSG['btn_closeCode']);
  $('#btn_validCode').text(MSG['btn_validCode']);
  $('#msg_ajax_ko').text(MSG['msg_ajax_ko']);
  $('#span_ajax_msg').text(MSG['span_ajax_msg']);    
  $("xml").find("category").each(function() {
	if (!$(this).attr('id')) {
	  $(this).attr('id', $(this).attr('name'));
	  $(this).attr('name', Blockly.Msg[$(this).attr('name')]);
	}
  });
};

document.write('<script src="lang/msg/' + Code.LANG + '.js"></script>\n');
document.write('<script src="lang/Blockly/' + Code.LANG + '.js"></script>\n');
document.write('<script src="lang/Arduino/' + Code.LANG + '.js"></script>\n');