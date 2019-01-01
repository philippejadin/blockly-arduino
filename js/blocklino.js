'use strict';

// init default values for settings :
var BlocklyDuino = {};
BlocklyDuino.selectedToolbox = "toolbox_arduino_all";
BlocklyDuino.selectedCard = 'uno';
BlocklyDuino.toolboxInIndexHtml = false;
BlocklyDuino.workspace = null;

// init blocklyduino
BlocklyDuino.init = function() {
  if ($('#toolbox').length) {
    BlocklyDuino.toolboxInIndexHtml = true;
  }
  if (!BlocklyDuino.toolboxInIndexHtml) {
    BlocklyDuino.loadToolboxDefinition();
  }
  Code.initLanguage();
  BlocklyDuino.workspace = Blockly.inject('content_blocks', {
    grid: {
      snap: true
    },
    sounds: false,
    media: 'media/',
    toolbox: BlocklyDuino.buildToolbox(),
    zoom: {
      controls: true,
      wheel: true
    }
  });
  BlocklyDuino.bindFunctions();
  BlocklyDuino.renderContent();
  BlocklyDuino.workspace.addChangeListener(BlocklyDuino.renderArduinoCodePreview);
  var urlFile = BlocklyDuino.getStringParamFromUrl('url', '');
  var loadOnce = null;
  try {
    loadOnce = window.localStorage.loadOnceBlocks;
  } catch (e) {}
  if (urlFile) {
    $.get(urlFile, function(data) {
      BlocklyDuino.loadBlocks(data);
    }, 'text');
  } else {
    BlocklyDuino.loadBlocks();
  }
  window.addEventListener('unload', BlocklyDuino.backupBlocks, false);
  BlocklyDuino.initCompilerFlasher();
};

// init the compiler system
BlocklyDuino.initCompilerFlasher = function() {
  compilerflasher = new compilerflasher(BlocklyDuino.getFiles);
  compilerflasher.on("pre_verify", function() {
    $("#cb_cf_operation_output").html(MSG['pre_verify']);
  });
  compilerflasher.on("verification_succeed", function(binary_size) {
    $("#cb_cf_operation_output").html(MSG['verification_succeed']);
  });
  compilerflasher.on("verification_failed", function(error_output) {
    $("#cb_cf_operation_output").html(MSG['verification_failed'] + error_output);
  });
  compilerflasher.on("flash_failed", function(error_output) {
    $("#cb_cf_operation_output").html(MSG['flash_failed'] + error_output);
  });
};

BlocklyDuino.getFiles = function() {
  var code = $('#pre_previewArduino').text();
  return {
    "sketch.ino": code.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  };
};
BlocklyDuino.renderContent = function() {
  BlocklyDuino.workspace.render();
  $(".blocklyTreeSeparator").removeAttr("style");
  $(".blocklyToolboxDiv").show();
};
BlocklyDuino.renderArduinoCodePreview = function() {
  $('#pre_previewArduino').text(Blockly.Arduino.workspaceToCode(BlocklyDuino.workspace));
  if (typeof prettyPrintOne == 'function') {
    $('#pre_previewArduino').html(prettyPrintOne($('#pre_previewArduino').html(), 'cpp'));
  }
};
BlocklyDuino.getStringParamFromUrl = function(name, defaultValue) {
  var val = location.search.match(new RegExp('[?&]' + name + '=([^&]+)'));
  return val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : defaultValue;
};
BlocklyDuino.addReplaceParamToUrl = function(url, param, value) {
  var re = new RegExp("([?&])" + param + "=.*?(&|$)", "i");
  var separator = url.indexOf('?') !== -1 ? "&" : "?";
  if (url.match(re)) {
    return url.replace(re, '$1' + param + "=" + value + '$2');
  } else {
    return url + separator + param + "=" + value;
  }
};
BlocklyDuino.loadBlocks = function(defaultXml) {
  if (defaultXml) {
    var xml = Blockly.Xml.textToDom(defaultXml);
    Blockly.Xml.domToWorkspace(xml, BlocklyDuino.workspace);
  } else {
    var loadOnce = null;
    try {
      loadOnce = window.localStorage.loadOnceBlocks;
    } catch (e) {}
    if (loadOnce != null) {
      delete window.localStorage.loadOnceBlocks;
      var xml = Blockly.Xml.textToDom(loadOnce);
      Blockly.Xml.domToWorkspace(xml, BlocklyDuino.workspace);
    }
  }
};
BlocklyDuino.backupBlocks = function() {
  if (typeof Blockly != 'undefined' && window.localStorage) {
    var xml = Blockly.Xml.workspaceToDom(BlocklyDuino.workspace);
    var text = Blockly.Xml.domToText(xml);
    window.localStorage.loadOnceBlocks = text;
  }
};
BlocklyDuino.saveXmlFile = function() {
  var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
  var toolbox = window.localStorage.toolbox;
  if (!toolbox) {
    toolbox = $("#toolboxes").val();
  }
  if (toolbox) {
    var newel = document.createElement("toolbox");
    newel.appendChild(document.createTextNode(toolbox));
    xml.insertBefore(newel, xml.childNodes[0]);
  }
  var toolboxids = window.localStorage.toolboxids;
  if (toolboxids === undefined || toolboxids === "") {
    if ($('#defaultCategories').length) {
      toolboxids = $('#defaultCategories').html();
    }
  }
  var data = Blockly.Xml.domToPrettyText(xml);
  var datenow = Date.now();
  var filename = "blocklino" + datenow + ".bloc";
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/bloc;charset=utf-8,' + encodeURIComponent(data));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
BlocklyDuino.load = function(event) {
  var files = event.target.files;
  if (files.length != 1) {
    return;
  }
  var reader = new FileReader();
  reader.onloadend = function(event) {
    var target = event.target;
    if (target.readyState == 2) {
      try {
        var xml = Blockly.Xml.textToDom(target.result);
      } catch (e) {
        alert(MSG['xmlError'] + '\n' + e);
        return;
      }
      var count = BlocklyDuino.workspace.getAllBlocks().length;
      if (count && confirm(MSG['xmlLoad'])) {
        BlocklyDuino.workspace.clear();
      }
      Blockly.Xml.domToWorkspace(xml, BlocklyDuino.workspace);
      BlocklyDuino.renderContent();
      var elem = xml.getElementsByTagName("toolbox")[0];
      if (elem != undefined) {
        var node = elem.childNodes[0];
        window.localStorage.toolbox = node.nodeValue;
        $("#toolboxes").val(node.nodeValue);
        window.location = window.location.protocol + '//' + window.location.host + window.location.pathname + '?toolbox=' + $("#toolboxes").val();
      }
    }
    $('#load').val('');
  };
  reader.readAsText(files[0]);
};
BlocklyDuino.discard = function() {
  var count = BlocklyDuino.workspace.getAllBlocks().length;
  if (count < 2 || window.confirm(MSG['discard'])) {
    BlocklyDuino.workspace.clear();
    var search = window.location.search;
    var newsearch = search.replace(/([?&]url=)[^&]*/, '');
    window.history.pushState(search, "Title", newsearch);
    BlocklyDuino.renderContent();
  }
};
BlocklyDuino.Undo = function() {
  Blockly.mainWorkspace.undo(0);
};
BlocklyDuino.Redo = function() {
  Blockly.mainWorkspace.undo(1);
};
BlocklyDuino.bindFunctions = function() {
  $('#btn_new').on("click", BlocklyDuino.discard);
  $('#btn_undo').on("click", BlocklyDuino.Undo);
  $('#btn_redo').on("click", BlocklyDuino.Redo);
  $('#btn_print').on("click", BlocklyDuino.workspace_capture);
  $('#btn_saveXML').on("click", BlocklyDuino.saveXmlFile);
  $('#btn_saveino').on("click", BlocklyDuino.saveino);
  $('#btn_preview').on("click", function() {
    $("#toggle").toggle("slide");
  });
  $('#pre_previewArduino').on("click", function() {
    $("#toggle").toggle("slide");
  });
  $('#cb_cf_verify_btn').mouseover(function() {
    document.getElementById("survol").textContent = "Verify";
  }).mouseout(function() {
    document.getElementById("survol").textContent = "";
  });
  $('#cb_cf_flash_btn').mouseover(function() {
    document.getElementById("survol").textContent = "Upload";
  }).mouseout(function() {
    document.getElementById("survol").textContent = "";
  });
  $('#btn_cb').mouseover(function() {
    document.getElementById("survol").textContent = "installer le plugin codebender";
  }).mouseout(function() {
    document.getElementById("survol").textContent = "";
  });
  $('#toolboxes').on("focus", function() {
    BlocklyDuino.selectedToolbox = $(this).val();
  });
  $('#toolboxes').on("change", BlocklyDuino.changeToolboxDefinition);
  $('#configModal').on('hidden.bs.modal', function(e) {
    BlocklyDuino.loadToolboxDefinition(BlocklyDuino.selectedToolbox);
  });
  $('#load').on("change", BlocklyDuino.load);
  $('#btn_fakeload').on("click", function() {
    $('#load').click();
  });
  $('#btn_config').on("click", BlocklyDuino.openConfigToolbox);
  $('#select_all').on("click", BlocklyDuino.checkAll);
  $('#btn_valid_config').on("click", BlocklyDuino.changeToolbox);
  $('#btn_example').on("click", BlocklyDuino.buildExamples);
};
BlocklyDuino.checkAll = function() {
  if (this.checked) {
    $('#modal-body-config input:checkbox[id^=checkbox_]').each(function() {
      this.checked = true;
    });
  } else {
    $('#modal-body-config input:checkbox[id^=checkbox_]').each(function() {
      this.checked = false;
    });
  }
};
BlocklyDuino.openConfigToolbox = function() {
  var modalbody = $("#modal-body-config");
  var loadIds = window.localStorage.toolboxids;
  if (loadIds === undefined || loadIds === "") {
    if ($('#defaultCategories').length) {
      loadIds = $('#defaultCategories').html();
    } else {
      loadIds = '';
    }
  }
  if (BlocklyDuino.toolboxInIndexHtml) {
    $('#divToolbox').hide();
  }
  modalbody.empty();
  var i = 0,
    n;
  var ligne = "";
  $("#toolbox").children("category").each(function() {
    n = loadIds.search($(this).attr("id"));
    if (n >= 0) {
      ligne = '<input type="checkbox" checked="checked" name="checkbox_' + i + '" id="checkbox_' + $(this).attr("id") + '"/> ' + Blockly.Msg[$(this).attr("id")] + '<br/>';
    } else {
      ligne = '<input type="checkbox" name="checkbox_' + i + '" id="checkbox_' + $(this).attr("id") + '"/> ' + Blockly.Msg[$(this).attr("id")] + '<br/>';
    }
    i++;
    modalbody.append(ligne);
  });
};
BlocklyDuino.changeToolbox = function() {
  BlocklyDuino.backupBlocks();
  var toolboxIds = [];
  $('#modal-body-config input:checkbox[id^=checkbox_]').each(function() {
    if (this.checked == true) {
      var xmlid = this.id;
      toolboxIds.push(xmlid.replace("checkbox_", ""));
    }
  });
  window.localStorage.toolboxids = toolboxIds;
  var search = window.location.search;
  if ($("#put_in_url").prop('checked')) {
    search = BlocklyDuino.addReplaceParamToUrl(search, 'toolboxids', toolboxIds);
  } else {
    search = search.replace(/([?&]toolboxids=)[^&]*/, '');
  }
  window.localStorage.toolbox = $("#toolboxes").val();
  search = BlocklyDuino.addReplaceParamToUrl(search, 'toolbox', $("#toolboxes").val());
  window.location = window.location.protocol + '//' + window.location.host + window.location.pathname + search;
};
BlocklyDuino.buildToolbox = function() {
  var loadIds = BlocklyDuino.getStringParamFromUrl('toolboxids', '');
  if (loadIds === undefined || loadIds === "") {
    loadIds = window.localStorage.toolboxids;
  }
  if (loadIds === undefined || loadIds === "") {
    if ($('#defaultCategories').length) {
      loadIds = $('#defaultCategories').html();
    } else {
      loadIds = '';
    }
  }
  window.localStorage.toolboxids = loadIds;
  var xmlValue = '<xml id="toolbox">';
  var xmlids = loadIds.split(",");
  for (var i = 0; i < xmlids.length; i++) {
    if ($('#' + xmlids[i]).length) {
      xmlValue += $('#' + xmlids[i])[0].outerHTML;
    }
  }
  xmlValue += '</xml>';
  return xmlValue;
};
BlocklyDuino.loadToolboxDefinition = function(toolboxFile) {
  if (!toolboxFile) {
    toolboxFile = BlocklyDuino.getStringParamFromUrl('toolbox', '');
  }
  if (!toolboxFile) {
    toolboxFile = window.localStorage.toolbox;
  }
  if (!toolboxFile) {
    toolboxFile = BlocklyDuino.selectedToolbox;
  }
  $("#toolboxes").val(toolboxFile);
  $.ajax({
    type: "GET",
    url: "./toolbox/" + toolboxFile + ".xml",
    dataType: "xml",
    async: false
  }).done(function(data) {
    var toolboxXml = '<xml id="toolbox" style="display: none">';
    toolboxXml += $(data).find('toolbox').html();
    toolboxXml += '</xml>';
    $("#toolbox").remove();
    $('body').append(toolboxXml);
    $("xml").find("category").each(function() {
      if (!$(this).attr('id')) {
        $(this).attr('id', $(this).attr('name'));
        $(this).attr('name', Blockly.Msg[$(this).attr('name')]);
      }
    });
  }).fail(function(data) {
    $("#toolbox").remove();
  });
};
BlocklyDuino.changeToolboxDefinition = function() {
  BlocklyDuino.loadToolboxDefinition($("#toolboxes").val());
  BlocklyDuino.openConfigToolbox();
};
BlocklyDuino.buildExamples = function() {
  $.ajax({
    cache: false,
    url: "./examples/examples.json",
    dataType: "json",
    success: function(data) {
      $("#includedContent").empty();
      $.each(data, function(i, example) {
        if (example.visible) {
          var line = "<tr>" +
            "<td><a href='?url=./examples/" + example.source_url + "'>" +
            example.source_text +
            "</a></td>" +
            "<td>" +
            "<a href='./examples/" + example.image + "' target=_blank>" +
            "<img class='vignette' src='./examples/" + example.image + "'>" +
            "</a>" +
            "</td>" +
            "<td>" +
            "<a href='./examples/" + example.link_url + "' target=_blank>" +
            example.link_text +
            "</a>" +
            "</td>" +
            "</tr>";
          $("#includedContent").append(line);
        }
      });
    }
  });
};
Blockly.Variables.flyoutCategory = function(workspace) {
  var variableList = workspace.variableList;
  variableList.sort(goog.string.caseInsensitiveCompare);
  var xmlList = [];
  var button = goog.dom.createDom('button');
  button.setAttribute('text', Blockly.Msg.NEW_VARIABLE);
  button.setAttribute('callbackKey', 'CREATE_VARIABLE');
  Blockly.registerButtonCallback('CREATE_VARIABLE', function(button) {
    Blockly.Variables.createVariable(button.getTargetWorkspace());
  });
  xmlList.push(button);
  if (variableList.length > 0) {
    if (Blockly.Blocks['variables_set_init']) {
      var block = goog.dom.createDom('block');
      block.setAttribute('type', 'variables_set_init');
      block.setAttribute('gap', 8);
      var field = goog.dom.createDom('field', null, variableList[0]);
      field.setAttribute('name', 'VAR');
      block.appendChild(field);
      xmlList.push(block);
    }
    if (Blockly.Blocks['variables_set']) {
      var block = goog.dom.createDom('block');
      block.setAttribute('type', 'variables_set');
      block.setAttribute('gap', 8);
      var field = goog.dom.createDom('field', null, variableList[0]);
      field.setAttribute('name', 'VAR');
      block.appendChild(field);
      xmlList.push(block);
    }
    if (Blockly.Blocks['math_change']) {
      var block = goog.dom.createDom('block');
      block.setAttribute('type', 'math_change');
      block.setAttribute('gap', 8);
      var field = goog.dom.createDom('field', null, variableList[0]);
      field.setAttribute('name', 'VAR');
      block.appendChild(field);
      xmlList.push(block);
    }
    if (Blockly.Blocks['variables_const']) {
      var block = goog.dom.createDom('block');
      block.setAttribute('type', 'variables_const');
      block.setAttribute('gap', 8);
      var field = goog.dom.createDom('field', null, variableList[0]);
      field.setAttribute('name', 'VAR');
      block.appendChild(field);
      xmlList.push(block);
    }
    if (Blockly.Blocks['base_define_const']) {
      var block = goog.dom.createDom('block');
      block.setAttribute('type', 'base_define_const');
      if (Blockly.Blocks['variables_get']) {
        block.setAttribute('gap', 16);
      }
      var field = goog.dom.createDom('field', null, variableList[0]);
      field.setAttribute('name', 'VAR');
      block.appendChild(field);
      xmlList.push(block);
    }
    for (var i = 0; i < variableList.length; i++) {
      if (Blockly.Blocks['variables_get']) {
        var block = goog.dom.createDom('block');
        block.setAttribute('type', 'variables_get');
        if (Blockly.Blocks['variables_set']) {
          block.setAttribute('gap', 8);
        }
        var field = goog.dom.createDom('field', null, variableList[i]);
        field.setAttribute('name', 'VAR');
        block.appendChild(field);
        xmlList.push(block);
      }
    }
  }
  return xmlList;
};
BlocklyDuino.workspace_capture = function() {
  var ws = BlocklyDuino.workspace.svgBlockCanvas_.cloneNode(true);
  ws.removeAttribute("width");
  ws.removeAttribute("height");
  ws.removeAttribute("transform");
  var styleElem = document.createElementNS("http://www.w3.org/2000/svg", "style");
  styleElem.textContent = Blockly.Css.CONTENT.join('');
  ws.insertBefore(styleElem, ws.firstChild);
  var bbox = BlocklyDuino.workspace.svgBlockCanvas_.getBBox();
  var canvas = document.createElement("canvas");
  canvas.width = Math.ceil(bbox.width + 10);
  canvas.height = Math.ceil(bbox.height + 10);
  var ctx = canvas.getContext("2d");
  var xml = new XMLSerializer().serializeToString(ws);
  xml = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + bbox.width + '" height="' + bbox.height + '" viewBox="' + bbox.x + ' ' + bbox.y + ' ' + bbox.width + ' ' + bbox.height + '"><rect width="100%" height="100%" fill="white"></rect>' + xml + '</svg>';
  var img = new Image();
  img.setAttribute("src", 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(xml))));
  img.onload = function() {
    ctx.drawImage(img, 5, 5);
    var canvasdata = canvas.toDataURL("image/png", 1);
    var datenow = Date.now();
    var a = document.createElement("a");
    a.download = "capture" + datenow + ".png";
    a.href = canvasdata;
    document.body.appendChild(a);
    a.click();
  }
};
BlocklyDuino.saveino = function() {
  var code = $('#pre_previewArduino').text();
  var datenow = Date.now();
  var filename = "arduino" + datenow + ".ino";
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/ino;charset=utf-8,' + encodeURIComponent(code));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
