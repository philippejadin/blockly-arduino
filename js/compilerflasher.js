compilerflasher = function(loadFiles) {
    this.boards_list = [];
    this.boardsListExists = false;
    this.programmers_list = [];
    this.selectedBoard = "";
    this.selectedProgrammer = "";
    this.load_files = loadFiles;
    this.loaded_elements = [];
    this.enableShortCuts = false;
    this.minVersion = {
        pluginFirefox: "1.6.2.2",
        pluginChrome: "1.6.0.8",
        app: "1.0.0.8"
    };
    this.chromeClient = "/embed/chrome-client.js";
    this.minimumChromeVersion = 43;
    this.chromeUpdateForProgrammersMessage = "Due to a Chrome bug, to use programmers (or devices that internally use a programmer) you need to update your Chrome to version " + this.minimumChromeVersion + " or above.";
    this.isChromeNotSuitableForProgrammers = false;
    this.pluginOrApp = "plugin";
    this.useApp = false;
    this.useChrome = false;
    this.embedded = false;
    var selfCf = this;
    this.eventManager = new function() {
        this._listeners = {};
        this.addListener = function(type, listener) {
            if (typeof this._listeners[type] === "undefined") this._listeners[type] = [];
            this._listeners[type].push(listener)
        };
        this.fire = function(event) {
            if (typeof event === "string") event = {
                type: event
            };
            if (!event.target) event.target = this;
            if (!event.type) throw new Error('Event object missing "type" property.');
            if (this._listeners[event.type] instanceof Array) {
                var eventArguments = [];
                var i;
                var argumentsLength = arguments.length;
                for (i = 1; i < argumentsLength; i++) eventArguments.push(arguments[i]);
                var listeners = this._listeners[event.type];
                var listenersLength = listeners.length;
                for (i = 0; i < listenersLength; i++) listeners[i].apply(this, eventArguments)
            }
        };
        this.removeListener = function(type, listener) {
            if (this._listeners[type] instanceof Array) {
                var listeners = this._listeners[type];
                var listenersLength = listeners.length;
                for (var i = 0; i < listenersLength; i++)
                    if (listeners[i] === listener) {
                        listeners.splice(i, 1);
                        break
                    }
            }
        }
    };
    this.on = function(type, listener) {
        this.eventManager.addListener(type, listener)
    };
    this.setOperationOutput = function(message) {
        var $cbCfOperationOutput = $("#cb_cf_operation_output");
        var $operationOutput = $("#operation_output");
        $cbCfOperationOutput.html(message);
        $operationOutput.html(message);
        if (message.length > 0) {
            $cbCfOperationOutput.removeClass("new-message").width();
            $cbCfOperationOutput.addClass("new-message");
            $operationOutput.removeClass("new-message").width();
            $operationOutput.addClass("new-message")
        }
    };
    this.pluginHandler = new function() {
        var selfPh = this;
        this.serialMonitorPort = null;
        var pluginLoggingInterval;
        var getFireInterval;
        var portValidatorInterval;
        var serialMonitorUpdater;
        this.uuid4 = function() {
            var time = (new Date).getTime();
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(charPosition) {
                var r = (time + Math.random() * 16) % 16 | 0;
                time = Math.floor(time / 16);
                return (charPosition == "x" ? r : r & 7 | 8).toString(16)
            })
        };
        this.tabID = this.uuid4();
        this.currentPorts = [];
        this.appNotFound = false;
        this.doflashBootloader = function(programmer, board) {
            if (selfCf.useApp && selfCf.isChromeNotSuitableForProgrammers) {
                selfCf.setOperationOutput(selfCf.chromeUpdateForProgrammersMessage);
                selfCf.eventManager.fire("flash_failed", selfCf.chromeUpdateForProgrammersMessage);
                return
            }
            this.codebenderPlugin.flashBootloader(this.portslist.selectedIndex == -1 || programmer["communication"] != "serial" ? "" : this.portslist.options[this.portslist.selectedIndex].text, programmer["protocol"], programmer["communication"], programmer["speed"], programmer["force"], programmer["delay"], board["bootloader"]["high_fuses"], board["bootloader"]["low_fuses"], typeof board["bootloader"]["extended_fuses"] == "undefined" ? "" : board["bootloader"]["extended_fuses"], typeof board["bootloader"]["unlock_bits"] == "undefined" ? "" : board["bootloader"]["unlock_bits"], typeof board["bootloader"]["lock_bits"] == "undefined" ? "" : board["bootloader"]["lock_bits"], board["build"]["mcu"], bootloader_callback)
        };
        this.clickedPort = function() {
            var port = $("#cb_cf_ports").val();
            var actionId = 43;
            var metaData = {
                selectedPort: port,
                tabID: this.tabID
            };
            createLogCompilerflasher(actionId, metaData)
        };
        this.oldPort = null;
        this.logPorts = function() {
            var oldPort;
            if (this.oldPort === null) oldPort = "";
            else oldPort = this.oldPort;
            var newPort = "";
            if (this.currentPorts.length > 0) newPort = $("#cb_cf_ports").find("option:selected").text();
            this.oldPort = newPort;
            if (oldPort != newPort) {
                var actionId = 38;
                var metaData = {
                    oldPort: oldPort,
                    newPort: newPort,
                    tabID: this.tabID
                };
                createLogCompilerflasher(actionId, metaData)
            }
        };
        this.savePort = function() {
            lawnchairOperation(function() {
                if (selfPh.currentPorts.length > 0) {
                    var port = $("#cb_cf_ports").find("option:selected").text();
                    this.save({
                        key: "port",
                        name: port
                    })
                }
            });
            selfPh.logPorts()
        };
        this.loadPort = function() {
            var $ports = $("#cb_cf_ports");
            if (this.plugin_running && this.currentPorts.length == 0 && $ports.find('option[value=""]').length == 0) {
                $ports.append('<option value="">Brancher la carte !<\/option>');
                return
            }
            $ports.find('option[value=""]').remove();

            function firstPortCallback() {
                var port = $ports.find("option:first").val();
                $ports.val(port)
            }
            lawnchairOperation(function() {
                this.exists("port", function(exists) {
                    if (!exists) {
                        firstPortCallback();
                        return
                    }
                    this.get("port", function(config) {
                        var port_exists = $ports.find('option[value="' + config.name + '"]').length;
                        if (port_exists > 0) $ports.val(config.name);
                        else {
                            var port = $ports.find("option:first").val();
                            $ports.val(port)
                        }
                    })
                })
            }, firstPortCallback)
        };
        this.saveBaudRate = function() {
            lawnchairOperation(function() {
                var baud = $("#cb_cf_baud_rates").val();
                this.save({
                    key: "baudRate",
                    value: baud
                })
            })
        };
        this.loadBaudRate = function() {
            lawnchairOperation(function() {
                this.exists("baudRate", function(exists) {
                    if (!exists) return;
                    this.get("baudRate", function(config) {
                        var $baudRate = $("#cb_cf_baud_rates");
                        var baud = $baudRate.find("option:first").val();
                        var baudSettingExists = $baudRate.find('option[value="' + config.value + '"]').length;
                        if (baudSettingExists > 0) baud = config.value;
                        $baudRate.val(baud)
                    })
                })
            })
        };
        this.initializePlugin = function() {
            var location = window.location;
            if (typeof window.location.origin != "undefined") location = window.location.origin;
            var actionId;
            var metaData;
            if (location.indexOf("codebender.cc") != -1 && typeof window.osBrowserIsSupported != "undefined" && !window.osBrowserIsSupported() && typeof window.isSupportedOs != "undefined") {
                actionId = 35;
                metaData = {
                    plugin: false,
                    message: "Unsupported OS/browser combination."
                };
                createLogCompilerflasher(actionId, metaData);
                var supportedOsMessage = '<i class="icon-warning-sign"><\/i> To program your Arduino from your browser, please use <a href="http://www.google.com/chrome/" target="_blank">Google Chrome<\/a>/Chromium (version 41 and above on Linux) or <a href="http://www.mozilla.org/en-US/firefox/" target="_blank">Mozilla Firefox<\/a> (32bit only on Windows).';
                var message = '<i class="icon-warning-sign"><\/i> To program your Arduino from your browser, please use <a href="http://www.google.com/chrome/" target="_blank">Google Chrome<\/a>/Chromium on Windows, Mac, Linux (version 41 and above) or Chrome OS (version 41 and above) or <a href="http://www.mozilla.org/en-US/firefox/" target="_blank">Mozilla Firefox<\/a> on Windows, Mac or Linux.';
                if (window.isSupportedOs()) message = supportedOsMessage;
                selfCf.setOperationOutput(message);
                selfCf.eventManager.fire("plugin_notification", message)
            } else {
                this.plugin_searched = false;
                this.plugin_found = false;
                this.plugin_initialized = false;
                this.plugin_validated = false;
                this.plugin_running = false;
                this.plugin_version = null;
                window.plugin_version = null;
                this.maxSerialMonitorBufferSize = 1024 * 5;
                this.maxSerialMonitorNewLines = 500;
                if (selfCf.useApp) {
                    this.maxSerialMonitorBufferSize = 1024 * 30;
                    this.maxSerialMonitorNewLines = 1024 * 3
                }
                if (selfCf.useApp) {
                    this.codebenderPlugin.onLost.addListener(function() {
                        if (!selfPh.appNotFound) {
                            selfPh.appNotFound = true;
                            selfPh.appLost()
                        }
                        setTimeout(function() {
                            selfPh.codebenderPlugin.init()
                        }, 3e3)
                    });
                    this.codebenderPlugin.onError.addListener(function(error) {
                        if (!error.badVersion && !selfPh.appNotFound) {
                            selfPh.appNotFound = true;
                            selfPh.appLost()
                        }
                    });
                    this.codebenderPlugin.init(function(version) {
                        selfPh.plugin_searched = true;
                        selfPh.plugin_found = true;
                        selfPh.appNotFound = false;
                        selfPh.runPlugin(version)
                    }, 5e3)
                } else {
                    this.searchPlugin();
                    if (!this.plugin_found) {
                        var alert = this.browserSpecificPluginInstall("To program your Arduino from your browser, install the codebender");
                        selfCf.setOperationOutput(alert);
                        selfCf.eventManager.fire("plugin_notification", alert);
                        actionId = 35;
                        metaData = {
                            plugin: false,
                            message: "Not on navigator plugins."
                        };
                        createLogCompilerflasher(actionId, metaData);
                        var pluginSearchInterval = setInterval(function() {
                            selfPh.searchPlugin();
                            if (selfPh.plugin_found) {
                                clearInterval(pluginSearchInterval);
                                selfPh.runPlugin()
                            }
                        }, 2e3)
                    } else this.runPlugin()
                }
            }
        };
        this.searchPlugin = function() {
            this.plugin_found = navigator.plugins["Codebender.cc"] !== undefined || navigator.plugins["Codebendercc"] !== undefined;
            this.plugin_searched = true
        };
        this.appLost = function() {
            clearInterval(pluginLoggingInterval);
            clearInterval(getFireInterval);
            selfPh.plugin_searched = true;
            selfPh.plugin_found = false;
            selfPh.plugin_initialized = false;
            selfPh.plugin_validated = false;
            selfPh.plugin_running = false;
            selfPh.plugin_version = null;
            window.plugin_version = null;
            var $cbCfPorts = $("#cb_cf_ports");
            $cbCfPorts.find("option").remove();
            $cbCfPorts.attr("disabled", "disabled");
            $("#cb_cf_flash_btn").attr("disabled", "disabled");
            $("#cb_cf_programmers").attr("disabled", "disabled");
            $("#cb_cf_flash_with_prog_btn").attr("disabled", "disabled");
            $("#cb_cf_burn_bootloader").attr("disabled", "disabled");
            $("#cb_cf_baud_rates").attr("disabled", "disabled");
            $("#cb_cf_serial_monitor_connect").attr("disabled", "disabled");
            var alert = selfPh.browserSpecificPluginInstall("To program your Arduino from your browser, install the codebender");
            selfCf.setOperationOutput(alert);
            selfCf.eventManager.fire("plugin_notification", alert);
            selfCf.eventManager.fire("plugin_not_found");
            var actionId = 35;
            var metaData = {
                plugin: false,
                message: "Not on navigator plugins."
            };
            createLogCompilerflasher(actionId, metaData)
        };
        this.runPlugin = function(version) {
            var actionId = 35;
            var metaData = {
                plugin: true,
                message: "Found on navigator plugins.",
                type: selfCf.pluginOrApp
            };
            createLogCompilerflasher(actionId, metaData);
            selfCf.setOperationOutput('<i class="icon-spinner icon-spin"><\/i>  Initializing ' + selfCf.pluginOrApp + ' ... Make sure that you allow plugin execution on your browser. <a href="http://feedback.codebender.cc/knowledgebase/topics/57328-plugin">More Info<\/a>');
            selfCf.eventManager.fire("plugin_notification", '<i class="icon-spinner icon-spin"><\/i>  Initializing ' + selfCf.pluginOrApp + ' ... Make sure that you allow plugin execution on your browser. <a href="http://feedback.codebender.cc/knowledgebase/topics/57328-plugin">More Info<\/a>');
            if (!selfCf.useApp) {
                $("body").append('<object id="plugin0" type="application/x-codebendercc" width="0" height="0" xmlns="http://www.w3.org/1999/html"><\/object>');
                selfPh.codebenderPlugin = document.getElementById("plugin0")
            }
            var plugin_init_interval = setInterval(function() {
                if (typeof selfPh.codebenderPlugin.probeUSB != "undefined") {
                    clearInterval(plugin_init_interval);
                    selfPh.plugin_initialized = true;
                    if (selfCf.useApp) {
                        selfPh.plugin_version = version;
                        selfPh.codebenderPlugin.version = version
                    } else selfPh.plugin_version = selfPh.codebenderPlugin.version;
                    window.plugin_version = selfPh.plugin_version;
                    var actionId = 35;
                    var metaData = {
                        plugin: true,
                        version: selfPh.codebenderPlugin.version,
                        type: selfCf.pluginOrApp
                    };
                    createLogCompilerflasher(actionId, metaData);
                    selfPh.validateVersion();
                    if (typeof selfPh.codebenderPlugin.setErrorCallback != "undefined") selfPh.codebenderPlugin.setErrorCallback(selfPh.plugin_error_logger);
                    if (selfCf.useApp && compilerflasher.pluginHandler.codebenderPlugin.api.local) Object.defineProperty(compilerflasher.pluginHandler, "tabID", {
                        get: function() {
                            return this.codebenderPlugin.api.local.clientId
                        }
                    });
                    if (!selfCf.useApp && typeof selfPh.codebenderPlugin.init != "undefined") {
                        selfPh.codebenderPlugin.init();
                        if (selfPh.codebenderPlugin.instance_id != "undefined") selfPh.tabID = parseInt(selfPh.codebenderPlugin.instance_id)
                    }
                    if (typeof selfPh.codebenderPlugin.closeTab != "undefined") $(window).unload(function() {
                        selfPh.codebenderPlugin.closeTab();
                        selfPh.codebenderPlugin.deleteMap()
                    });
                    else selfPh.disconnect()
                }
            }, 100)
        };
        this.showPlugin = function() {
            selfCf.setOperationOutput("");
            selfCf.eventManager.fire("plugin_running");
            $.each(selfCf.loaded_elements, function(key, value) {
                if (value != "cb_cf_boards" && selfCf.checkBoardDependantControl(value)) $("#" + value).removeAttr("disabled")
            });
            this.plugin_running = true;
            selfCf.unsupportedBoard(selfCf.selectedBoard.name)
        };
        this.parseVersionString = function(version) {
            if (typeof version != "string") return false;
            var token = version.split(".");
            var major = parseInt(token[0]) || 0;
            var minor = parseInt(token[1]) || 0;
            var patch = parseInt(token[2]) || 0;
            var build = parseInt(token[3]) || 0;
            return {
                major: major,
                minor: minor,
                patch: patch,
                build: build
            }
        };
        this.comparePluginVersions = function(firstVersion, secondVersion) {
            var major = firstVersion.major - secondVersion.major;
            var minor = firstVersion.minor - secondVersion.minor;
            var patch = firstVersion.patch - secondVersion.patch;
            var build = firstVersion.build - secondVersion.build;
            if (major != 0) return major;
            if (minor != 0) return minor;
            if (patch != 0) return patch;
            return build
        };
        this.validateVersion = function() {
            var minimumVersion = selfCf.minVersion.pluginFirefox;
            if (selfCf.useChrome) minimumVersion = selfCf.minVersion.pluginChrome;
            if (selfCf.useApp) minimumVersion = selfCf.minVersion.app;
            var compareVersion = this.comparePluginVersions(this.parseVersionString(this.codebenderPlugin.version), this.parseVersionString(minimumVersion));
            var alert;
            var actionId;
            var metaData;
            if (compareVersion < 0) {
                alert = this.browserSpecificPluginInstall("You need to update the codebender");
                selfCf.setOperationOutput(alert);
                selfCf.eventManager.fire("plugin_notification", alert);
                selfCf.eventManager.fire("update_plugin_or_app");
                actionId = 27;
                metaData = {
                    success: true,
                    plugin: false,
                    alert: "You need to update the codebender plugin or app."
                };
                createLogCompilerflasher(actionId, metaData);
                clearInterval(pluginLoggingInterval)
            } else if (this.codebenderPlugin.version === null) {
                alert = this.browserSpecificPluginInstall("To program your Arduino from your browser, install the codebender");
                selfCf.setOperationOutput(alert);
                selfCf.eventManager.fire("plugin_notification", alert);
                actionId = 27;
                metaData = {
                    success: true,
                    plugin: false,
                    alert: "To program your Arduino from your browser, install the codebender plugin or app."
                };
                createLogCompilerflasher(actionId, metaData);
                clearInterval(pluginLoggingInterval)
            } else {
                this.enableUSB();
                this.initializePluginPortsLogger();
                this.showPlugin()
            }
            this.plugin_validated = true
        };
        this.isPluginVisible = function() {
            if (selfCf.useApp) return true;
            var plugin0 = document.getElementById("plugin0");
            return window.getComputedStyle(plugin0) !== null
        };
        this.initializePluginPortsLogger = function() {
            if (typeof portsAvail == "undefined") window.portsAvail = [""];
            window.oldPortsAvail = portsAvail;
            if (typeof serialPortsAvail == "undefined") window.serialPortsAvail = [""];
            window.oldSerialPortsAvail = serialPortsAvail;

            function createPortsLog(ports, probeUsbPorts, parsedList) {
                var actionId = 36;
                var metaData = {
                    success: true,
                    plugin: true,
                    version: selfPh.codebenderPlugin.version,
                    tabID: selfPh.tabID,
                    serialLibPorts: ports,
                    probeUSBports: probeUsbPorts
                };
                createLogCompilerflasher(actionId, metaData);
                actionId = 74;
                metaData = {
                    success: true,
                    plugin: true,
                    version: selfPh.codebenderPlugin.version,
                    tabID: selfPh.tabID,
                    jsonPorts: parsedList
                };
                createLogCompilerflasher(actionId, metaData)
            }

            function getPortsCallback(portsList) {
                window.serialPortsAvail = portsList;
                if (oldSerialPortsAvail != serialPortsAvail) {
                    var parsedList = $.parseJSON(serialPortsAvail);
                    var ports = "";
                    $.each(parsedList, function(index, elem) {
                        ports += elem["port"] + ","
                    });
                    if (selfCf.useApp) selfPh.codebenderPlugin.probeUSB(function(probeUsbPorts) {
                        createPortsLog(ports, probeUsbPorts, parsedList)
                    });
                    else {
                        var probeUsbPorts = selfPh.codebenderPlugin.probeUSB();
                        createPortsLog(ports, probeUsbPorts, parsedList)
                    }
                }
                window.oldSerialPortsAvail = serialPortsAvail
            }
            var $ports = $("#cb_cf_ports");
            pluginLoggingInterval = setInterval(function() {
                try {
                    var actionId;
                    var metaData;
                    if (selfPh.isPluginVisible() && typeof selfPh.codebenderPlugin.probeUSB == "undefined") {
                        actionId = 34;
                        metaData = {
                            message: "Non catchable plugin crash.",
                            tabID: selfPh.tabID,
                            type: selfCf.pluginOrApp,
                            version: window.plugin_version == "undefined" || window.plugin_version === null ? "undefined" : window.plugin_version,
                            OS: {
                                name: typeof Browsers.os.name == "undefined" ? "undefined" : Browsers.os.name,
                                url: window.location.pathname,
                                version: Browsers.os.version === null || typeof Browsers.os.version.original == "undefined" ? "undefined" : Browsers.os.version.original
                            },
                            Browser: {
                                name: typeof Browsers.browser.name == "undefined" ? "undefined" : Browsers.browser.name,
                                version: typeof Browsers.browser.version == "undefined" || Browsers.browser.version === null ? "undefined" : Browsers.browser.version.original
                            }
                        };
                        createLogCompilerflasher(actionId, metaData);
                        selfCf.setOperationOutput("An unexpected error has occurred. Please refresh the page.");
                        clearInterval(pluginLoggingInterval)
                    } else {
                        if (selfPh.isPluginVisible() && typeof selfPh.codebenderPlugin.availablePorts == "undefined" && (oldPortsAvail.length < portsAvail.length || oldPortsAvail.length == 1 && portsAvail.length == 1 && oldPortsAvail[0] == "" && portsAvail[0] != "" || oldPortsAvail.length > portsAvail.length || oldPortsAvail.length == 1 && portsAvail.length == 1 && oldPortsAvail[0] != "" && portsAvail[0] == "")) {
                            var ports = {};
                            $ports.find("> option").each(function(index) {
                                ports[index] = this.text
                            });
                            actionId = 36;
                            metaData = {
                                success: true,
                                plugin: true,
                                version: selfPh.codebenderPlugin.version,
                                ports: ports
                            };
                            createLogCompilerflasher(actionId, metaData)
                        }
                        window.oldPortsAvail = portsAvail;
                        if (typeof selfPh.codebenderPlugin.getPorts != "undefined")
                            if (selfCf.useApp) selfPh.codebenderPlugin.getPorts(function(portsList) {
                                getPortsCallback(portsList)
                            });
                            else {
                                var portsList = selfPh.codebenderPlugin.getPorts();
                                getPortsCallback(portsList)
                            }
                    }
                } catch (error) {
                    actionId = 27;
                    metaData = {
                        success: false,
                        error: error
                    };
                    createLogCompilerflasher(actionId, metaData)
                }
            }, 500)
        };
        this.canBurnBootloader = function(programmer) {
            if (this.portslist.options[this.portslist.selectedIndex].value == "" && programmer["communication"] == "serial") return false;
            return true
        };
        this.doflash = function(select, board, programmer, binary, flash_callback) {
            if (select && typeof board["upload"]["protocol"] != "undefined")
                if (typeof this.portslist.options[this.portslist.selectedIndex] == "undefined") {
                    selfCf.eventManager.fire("flash_failed", "Could not connect to selected port. Make sure your board is properly connected.");
                    selfCf.setOperationOutput("Could not connect to selected port. Make sure your board is properly connected.")
                } else {
                    var disable_flushing = typeof board["upload"]["disable_flushing"] == "undefined" ? "" : board["upload"]["disable_flushing"];
                    if (this.isPluginVisible()) this.codebenderPlugin.flash(this.portslist.options[this.portslist.selectedIndex].text, binary, board["upload"]["maximum_size"], board["upload"]["protocol"], disable_flushing, board["upload"]["speed"], board["build"]["mcu"], flash_callback);
                    else flash_callback(null, 2)
                }
            else if (typeof programmer == "undefined") {
                selfCf.setOperationOutput("The selected device needs a programmer, and none was selected. Operation Aborted.");
                selfCf.eventManager.fire("flash_failed", "Could not connect to selected port. Make sure your board is properly connected.")
            } else {
                var selectedPort = typeof this.portslist.options[this.portslist.selectedIndex] == "undefined" ? "" : this.portslist.options[this.portslist.selectedIndex].text;
                if (this.isPluginVisible()) this.codebenderPlugin.flashWithProgrammer(selectedPort, binary, board["upload"]["maximum_size"], programmer["protocol"], programmer["communication"], programmer["speed"], programmer["force"], programmer["delay"], board["build"]["mcu"], flash_callback);
                else flash_callback(null, 2)
            }
        };
        this.canflash = function(board, programmer, useProgrammer) {
            if (programmer.communication == "serial" && this.currentPorts.length == 0) return false;
            useProgrammer = useProgrammer || false;
            var $ports = $("#cb_cf_ports");
            if ($ports.val() !== null && $ports.val() != "" || ($ports.val() === null || $ports.val() == "") && typeof board["upload"]["protocol"] == "undefined" || useProgrammer) {
                if (typeof this.portslist.options[this.portslist.selectedIndex] == "undefined" && programmer["communication"] == "serial" && (typeof board["upload"]["protocol"] == "undefined" || useProgrammer)) return false;
                return true
            } else return false
        };
        this.browserSpecificPluginInstall = function(alert) {
            var location = window.location;
            if (typeof window.location.origin != "undefined") location = window.location.origin;
            var href;
            if (location.indexOf("codebender.cc") == -1 || selfCf.embedded) {
                var refreshMessage = "";
                if (alert.indexOf("You need to update the codebender") > -1) refreshMessage += " (after the update please refresh the page)";
                href = generatePath("staticPlugin", "/static/plugin");
                alert += ' plugin or app. <a target="_blank" href="' + href + '">Learn more<\/a>.' + refreshMessage;
                return alert
            }
            if (window.isChrome()) {
                if (selfCf.useApp && alert.indexOf("You need to update the codebender") > -1) alert += ' app. <a href="http://feedback.codebender.cc/knowledgebase/articles/671065-how-to-update-codebender-app" target="_blank">Show me how<\/a>. (after the update please refresh the page)';
                else if (selfCf.useApp) alert += ' app. <a onclick=\'compilerflasher.pluginHandler.addTo("Chrome")\' href="javascript:void(0);" target="_blank">Add it to Chrome<\/a>.';
                else if (!selfCf.useApp && Browsers.isOs("Windows", ">=", "6.2")) {
                    selfCf.msiHref = generatePath("pluginMsi", "/Codebendercc.msi");
                    alert += ' plugin. <a onclick=\'compilerflasher.pluginHandler.addTo("Windows")\' id="msi-download-url" href = "javascript:void(0);" >Add it to Windows<\/a>.'
                } else if (!selfCf.useApp) alert += ' plugin. <a onclick=\'compilerflasher.pluginHandler.addTo("Chrome")\' href="https://chrome.google.com/webstore/detail/codebendercc-extension/fkjidelplakiboijmadcpcbpboihkmee" target="_blank">Add it to Chrome<\/a>.';
                return alert
            }
            if (window.isSupportedFirefox()) {
                selfCf.xpiHref = generatePath("pluginXpi", "/codebender.xpi");
                alert += ' plugin. <a onclick=\'compilerflasher.pluginHandler.addTo("Firefox")\' id="xpi-download-url" href = "javascript:void(0);" >Add it to Firefox<\/a>.';
                return alert
            }
        };
        this.addTo = function(where) {
            var pluginUrl = null;
            if (selfCf.useApp) chrome.webstore.install("https://chrome.google.com/webstore/detail/magknjdfniglanojbpadmpjlglepnlko", function() {
                selfCf.setOperationOutput("You may be asked to allow access to the codebender app once it is installed. Just press Allow.")
            });
            else if (where == "Firefox") pluginUrl = selfCf.xpiHref;
            else if (where == "Windows") pluginUrl = selfCf.msiHref;
            var actionId = 45;
            var metaData = {
                where: where
            };
            if (pluginUrl) createLogCompilerflasher(actionId, metaData, function() {
                window.skipUnloadCheck = true;
                window.location.replace(pluginUrl);
                window.skipUnloadCheck = false
            });
            else createLogCompilerflasher(actionId, metaData)
        };
        this.enableUSB = function() {
            this.connected = false;
            this.serialMonitorVal = "";
            this.serialMonitorToAppend = "";
            this.portslist = $("#cb_cf_ports")[0];
            this.oldPorts = null;
            setTimeout(function() {
                selfPh.scan()
            }, 200);
            setTimeout(function() {
                selfPh.loadPort()
            }, 500)
        };

        function getPortsCallback(currentPorts) {
            var ports = "";
            var jsonPorts = $.parseJSON(currentPorts);
            $.each(jsonPorts, function(index, elem) {
                ports += elem["port"];
                if (index != Object.keys(jsonPorts).length - 1) ports += ","
            });
            return ports
        }

        function getFireCallback(ports) {
            if (selfPh.oldPorts === null) {
                selfPh.logPorts();
                selfPh.oldPorts = ""
            }
            if (ports != selfPh.oldPorts) {
                $("#cb_cf_ports").find("option").remove();
                var portsAvail = ports.split(",");
                portsAvail = portsAvail.sort();
                selfPh.currentPorts = [];
                for (var i = 0; i < portsAvail.length; i++)
                    if (selfPh.portslist && portsAvail[i] != "") {
                        selfPh.portslist.options[i] = new Option(portsAvail[i], portsAvail[i], true, false);
                        selfPh.currentPorts.push(portsAvail[i])
                    }
                selfPh.oldPorts = ports;
                selfPh.loadPort();
                selfPh.logPorts()
            }
        }
        this.getFire = function() {
            var ports = "";
            try {
                if (!this.isPluginVisible()) return;
                if (typeof this.codebenderPlugin.getPorts != "undefined")
                    if (selfCf.useApp) this.codebenderPlugin.getPorts(function(currentPorts) {
                        ports = getPortsCallback(currentPorts);
                        getFireCallback(ports)
                    });
                    else {
                        var currentPorts = this.codebenderPlugin.getPorts();
                        ports = getPortsCallback(currentPorts);
                        getFireCallback(ports)
                    }
                else if (selfCf.useApp) this.codebenderPlugin.probeUSB(function(ports) {
                    getFireCallback(ports)
                });
                else {
                    ports = this.codebenderPlugin.probeUSB();
                    getFireCallback(ports)
                }
            } catch (error) {
                $("#cb_cf_ports").find("option").remove();
                this.oldPorts = ports
            }
        };
        this.scan = function() {
            window.hasPerm = this.codebenderPlugin.setCallback(function(from, output) {
                if (typeof output === "object" && output.isCrazyLog) {
                    var actionId = 3e4;
                    createLogCompilerflasher(actionId, output)
                } else if (output == "disconnect") compilerflasher.pluginHandler.disconnect(true);
                else if (typeof output != "number") {
                    compilerflasher.eventManager.fire("plugin_notification", output);
                    compilerflasher.setOperationOutput(output)
                }
            });
            if (typeof window.hasPerm != "undefined" && !window.hasPerm) {
                compilerflasher.setOperationOutput("You need to grant permissions to the codebender");
                compilerflasher.eventManager.fire("plugin_notification", "You need to grant permissions to the codebender")
            }
            this.getFire();
            getFireInterval = setInterval(function() {
                selfPh.getFire()
            }, 1e3)
        };
        this.show_alert = function(message, divname) {
            var alertElement = $('<div id="' + divname + '" class="alert">' + message + "<\/div>");
            var $portsDiv = $("#cb_cf_ports_div");
            $portsDiv.find(".alert").hide(100).remove();
            $portsDiv.prepend(alertElement)
        };
        this.toggle = function() {
            if (this.connected) this.disconnect();
            else this.connect()
        };
        this.portValidatorIntervalRuns = false;
        this.connect = function() {
            if (window.operationInProgress) return;
            window.operationInProgress = true;
            selfCf.setOperationOutput("");
            if (this.connected) {
                window.operationInProgress = false;
                this.disconnect();
                return
            }
            var $baudRates = $("#cb_cf_baud_rates");
            var speed = $baudRates.find("option:selected").val();
            var $ports = $("#cb_cf_ports");
            var $serialHud = $("#serial_hud");
            var actionId = 18;
            var metaData = {
                baudrate: speed,
                port: $ports.val(),
                tabID: this.tabID,
                type: selfCf.pluginOrApp
            };
            createLogCompilerflasher(actionId, metaData);
            if ($ports.val() === null || $ports.val() == "") {
                window.operationInProgress = false;
                selfCf.setOperationOutput("Please select a valid port!");
                selfCf.eventManager.fire("plugin_notification", "Please select a valid port!");
                return
            }
            selfPh.serialMonitorPort = $ports.val();
            var $serialMonitorConnect = $("#cb_cf_serial_monitor_connect");
            $serialMonitorConnect.addClass("active");
            $baudRates.attr("disabled", "disabled");
            $("#serial_monitor_content").fadeIn(300);
            this.connected = true;
            selfCf.eventManager.fire("serial-monitor-connected");
            this.serialMonitorInitialized = selfCf.useApp;
            $serialMonitorConnect.html('déconnecter').off("click").click(function() {
                selfPh.disconnect()
            });
            $serialHud.html("");
            this.serialMonitorStats = {
                bytesReceived: 0,
                bytesSend: 0,
                sendButtonPressed: 0
            };

            function serialReadCallback(from, line) {
                if (!selfPh.serialMonitorInitialized) {
                    if (line.indexOf("connection at") > -1) $serialHud.html(line);
                    else if (line.indexOf("connected at") > -1) {
                        $serialHud.html(line);
                        selfPh.serialMonitorInitialized = true
                    }
                    return
                }
                if (selfPh.serialMonitorInitialized) selfPh.serialMonitorStats.bytesReceived += line.length;
                selfPh.serialHudAppendString(line);
                selfCf.eventManager.fire("serial-monitor-received-data", line);
                if (selfCf.useApp) appDataRateMeter.dataRateMeter(line.length, "send")
            }

            function serialCloseCallback(from, line) {
                var actionId = 69;
                var metaData = {
                    retVal: line,
                    type: selfCf.pluginOrApp,
                    version: window.plugin_version == "undefined" || window.plugin_version === null ? "undefined" : window.plugin_version,
                    url: window.location.pathname,
                    OS: {
                        name: typeof Browsers.os.name == "undefined" ? "undefined" : Browsers.os.name,
                        version: Browsers.os.version === null || typeof Browsers.os.version.original == "undefined" ? "undefined" : Browsers.os.version.original
                    },
                    Browser: {
                        name: typeof Browsers.browser.name == "undefined" ? "undefined" : Browsers.browser.name,
                        version: typeof Browsers.browser.version == "undefined" || Browsers.browser.version === null ? "undefined" : Browsers.browser.version.original
                    }
                };
                createLogCompilerflasher(actionId, metaData);
                var retVal = parseInt(line, 10);
                if (retVal != 0) {
                    var msg = compilerflasher.getFlashFailMessage(line);
                    compilerflasher.setOperationOutput(msg);
                    compilerflasher.eventManager.fire("plugin_notification", msg)
                }
                var notified = false;
                if (retVal == -22) notified = true;
                if (selfCf.useApp) selfPh.disconnect(notified)
            }
            var port = this.portslist.options[this.portslist.selectedIndex].text;
            this.codebenderPlugin.serialRead(port, speed, serialReadCallback, serialCloseCallback);
            this.serialMonitorToAppend = "";
            this.serialMonitorVal = "";
            $serialHud.html(escapeHtml(this.serialMonitorVal));
            if (selfCf.useApp && typeof window.isWindowsWithChromeApp != "undefined" && window.isWindowsWithChromeApp()) $serialHud.append(escapeHtml("Warning! Because of a known bug on Chrome, you should press the disconnect button before physically disconnecting your device.\nOr else the connection with the serial monitor will stay open until you restart your browser.\n\n"));
            if (selfCf.useApp) {
                appDataRateMeter.init();
                var baudMaxRate = $baudRates.find("option:selected").val();
                baudMaxRate = parseInt(baudMaxRate, 10) / 8;
                var tabID = compilerflasher.pluginHandler.tabID;
                var messageBytes;
                this.codebenderPlugin.onRawMessageReceived.addListener(function(byteArray) {
                    messageBytes = byteArray.length;
                    var timestamp = getTstamp();
                    if (messageBytes > 0 && baudMaxRate > 0 && messageBytes > baudMaxRate) appRawDataMeter.storeRawDataMeter(messageBytes, timestamp, baudMaxRate, tabID)
                }, {
                    forceAsync: false
                })
            }
            serialMonitorUpdater = setInterval(function() {
                if (selfPh.serialMonitorToAppend != "") {
                    var total_length = selfPh.serialMonitorToAppend.length + selfPh.serialMonitorVal.length;
                    if (total_length > selfPh.maxSerialMonitorBufferSize) {
                        selfPh.serialMonitorVal = selfPh.serialMonitorVal.substring(total_length - selfPh.maxSerialMonitorBufferSize) + selfPh.serialMonitorToAppend;
                        $serialHud.html(escapeHtml(selfPh.serialMonitorVal))
                    } else {
                        selfPh.serialMonitorVal = selfPh.serialMonitorVal + selfPh.serialMonitorToAppend;
                        $serialHud.append(escapeHtml(selfPh.serialMonitorToAppend))
                    }
                    selfPh.serialMonitorToAppend = "";
                    selfPh.autoScroll()
                }
            }, 50);

            function availablePortsCallback() {
                clearInterval(portValidatorInterval);
                selfPh.portValidatorIntervalRuns = false;
                selfPh.disconnect(false)
            }
            if (typeof this.codebenderPlugin.availablePorts != "undefined") portValidatorInterval = setInterval(function() {
                selfPh.portValidatorIntervalRuns = true;
                if (selfCf.useApp) selfPh.codebenderPlugin.availablePorts(function(ports) {
                    if (ports.indexOf(port) == -1) availablePortsCallback()
                });
                else if (selfPh.isPluginVisible() && selfPh.codebenderPlugin.availablePorts) {
                    var ports = selfPh.codebenderPlugin.availablePorts();
                    if (ports.indexOf(port) == -1) availablePortsCallback()
                }
            }, 100);
            selfCf.setOperationOutput("");
            window.operationInProgress = false
        };
        this.disconnect = function(notified) {
            if (!this.connected) return;
            window.operationInProgress = true;
            notified = notified || false;
            var $baudRates = $("#cb_cf_baud_rates");
            if (!notified) {
                var actionId = 59;
                var metaData = {
                    baudrate: $baudRates.find("option:selected").val(),
                    port: selfPh.serialMonitorPort,
                    tabID: this.tabID,
                    serialMonitorStats: this.serialMonitorStats
                };
                createLogCompilerflasher(actionId, metaData)
            }
            selfPh.serialMonitorPort = null;
            if (!notified && selfPh.portValidatorIntervalRuns) {
                clearInterval(portValidatorInterval);
                selfPh.portValidatorIntervalRuns = false
            }
            var $serialMonitorConnect = $("#cb_cf_serial_monitor_connect");
            $serialMonitorConnect.html('connecter').off("click").click(function() {
                selfPh.connect()
            });
            this.connected = false;
            this.serialMonitorInitialized = false;
            selfCf.eventManager.fire("serial-monitor-disconnected");
            $baudRates.removeAttr("disabled");
            $serialMonitorConnect.attr("disabled", "disabled");
            setTimeout(function() {
                window.operationInProgress = false;
                if (!selfCf.serial_monitor_disabled) $serialMonitorConnect.removeAttr("disabled")
            }, 2e3);
            $serialMonitorConnect.removeClass("active");
            $("#serial_monitor_content").fadeOut(300);
            clearInterval(serialMonitorUpdater);
            if (!notified && this.isPluginVisible() && this.codebenderPlugin.serialMonitorSetStatus) selfPh.codebenderPlugin.serialMonitorSetStatus();
            if (selfCf.useApp) appDataRateMeter.clearDataRateData()
        };
        this.autoScroll = function() {
            var $serialHud = $("#serial_hud");
            if ($("#autoscroll_check").is(":checked")) $serialHud.scrollTop($serialHud.get(0).scrollHeight)
        };
        this.serialHudAppendString = function(msg) {
            if (msg.indexOf("\r\n") != -1) msg = msg.replace(/\r\n/g, "\n");
            if (msg.indexOf("\r") != -1) msg = msg.replace(/\r/g, "");
            var total_length = this.serialMonitorToAppend.length + msg.length;
            if (total_length > this.maxSerialMonitorBufferSize) this.serialMonitorToAppend = this.serialMonitorToAppend.substring(total_length - this.maxSerialMonitorBufferSize) + msg;
            else this.serialMonitorToAppend = this.serialMonitorToAppend + msg
        };
        this.serialHudAppend = function(line) {
            var $serialHud = $("#serial_hud");
            if (isNaN(line)) this.serialHudWrite($serialHud.html() + line + "<br>");
            else {
                if (line == "13") return;
                if (line == "10") serialHudWrite($serialHud.html() + "<br>");
                if (line != "10") serialHudWrite($serialHud.html() + String.fromCharCode(line))
            }
        };
        this.serialHudWrite = function(message) {
            var $serialHud = $("#serial_hud");
            if ($serialHud.find("br").length > this.maxSerialMonitorNewLines) $serialHud.html(message.substring(message.indexOf("<br>") + 4));
            else if ($serialHud.html().length > this.maxSerialMonitorBufferSize) $serialHud.html(message.substring($serialHud.html().length - this.maxSerialMonitorBufferSize));
            else $serialHud.html(message);
            this.autoScroll()
        };
        this.serialSendOnEnter = function(event) {
            var e = event || window.event;
            if (e.keyCode == "13") this.serialSend();
            else if (e.keyCode == "10") this.serialSend()
        };
        this.serialSend = function() {
            var inputText = $("#text2send").val();
            var lineEndings = $("#serial-line-endings").val();
            var breakFlag = false;
            if (lineEndings == "nl") {
                inputText += "\n";
                breakFlag = true
            } else if (lineEndings == "cr") inputText += "\r";
            else if (lineEndings == "nlcr") {
                inputText += "\r\n";
                breakFlag = true
            }
            if (selfCf.useApp) appDataRateMeter.dataRateMeter(inputText.length, "received");
            var comparePluginVersion = this.comparePluginVersions(this.parseVersionString(this.codebenderPlugin.version), this.parseVersionString("1.6.0.8"));
            if (selfCf.useApp || comparePluginVersion <= 0) this.codebenderPlugin.serialWrite(inputText);
            else this.codebenderPlugin.serialWrite(inputText, this.serialMonitorPort);
            if ($("#echo_check").is(":checked")) {
                var message = '<span class="serial-monitor-echo">' + escapeHtml(inputText) + "<\/span>";
                if (breakFlag) message += "<br>";
                this.serialHudWrite($("#serial_hud").html() + message)
            }
            this.serialMonitorStats.bytesSend += inputText.length;
            this.serialMonitorStats.sendButtonPressed++
        };
        this.plugin_error_logger = function(from, msg, status) {
            var actionId;
            var metaData;
            if (typeof status == "undefined" || status == 0) {
                actionId = 34;
                metaData = {
                    type: selfCf.pluginOrApp,
                    message: msg,
                    version: window.plugin_version == "undefined" || window.plugin_version === null ? "undefined" : window.plugin_version,
                    url: window.location.pathname,
                    tabID: selfPh.tabID,
                    OS: {
                        name: typeof Browsers.os.name == "undefined" ? "undefined" : Browsers.os.name,
                        version: Browsers.os.version === null || typeof Browsers.os.version.original == "undefined" ? "undefined" : Browsers.os.version.original
                    },
                    Browser: {
                        name: typeof Browsers.browser.name == "undefined" ? "undefined" : Browsers.browser.name,
                        version: typeof Browsers.browser.version == "undefined" || Browsers.browser.version === null ? "undefined" : Browsers.browser.version.original
                    }
                };
                createLogCompilerflasher(actionId, metaData)
            } else if (status == 1) {
                actionId = 55;
                metaData = {
                    type: selfCf.pluginOrApp,
                    message: msg,
                    version: window.plugin_version == "undefined" || window.plugin_version === null ? "undefined" : window.plugin_version,
                    url: window.location.pathname,
                    tabID: selfPh.tabID,
                    OS: {
                        name: typeof Browsers.os.name == "undefined" ? "undefined" : Browsers.os.name,
                        version: Browsers.os.version === null || typeof Browsers.os.version.original == "undefined" ? "undefined" : Browsers.os.version.original
                    },
                    Browser: {
                        name: typeof Browsers.browser.name == "undefined" ? "undefined" : Browsers.browser.name,
                        version: typeof Browsers.browser.version == "undefined" || Browsers.browser.version === null ? "undefined" : Browsers.browser.version.original
                    }
                };
                createLogCompilerflasher(actionId, metaData)
            }
        }
    };
    this.saveBoard = function() {
        var $boards = $("#cb_cf_boards");
        $boards.find('option[value=""]').remove();
        lawnchairOperation(function() {
            this.save({
                key: "board",
                name: $boards.find("option:selected").text()
            })
        });
        var oldBoard = this.selectedBoard.name;
        this.selectedBoard = this.boards_list[$boards.prop("selectedIndex")];
        var newBoard = this.selectedBoard.name;
        var actionId = 37;
        var metaData = {
            oldBoard: oldBoard,
            newBoard: newBoard,
            tabID: this.pluginHandler.tabID
        };
        createLogCompilerflasher(actionId, metaData);
        this.enableBoardDependantControls();
        this.unsupportedBoard(newBoard)
    };
    this.loadBoard = function() {
        var $boards = $("#cb_cf_boards");
        $boards.prepend('<option value="" disabled selected>Choisir la carte à programmer<\/option>');
        lawnchairOperation(function() {
            this.exists("board", function(exists) {
                if (exists) this.get("board", function(config) {
                    if (selfCf.checkBoardExists(config.name)) {
                        $boards.val(config.name);
                        $boards.find('option[value=""]').remove();
                        selfCf.selectedBoard = selfCf.boards_list[$boards.prop("selectedIndex")];
                        selfCf.enableBoardDependantControls()
                    }
                })
            })
        })
    };
    this.checkBoardExists = function(board) {
        var boardsList = this.getBoardsList();
        for (var i = 0; i < boardsList.length; i++)
            if (boardsList[i].name == board) return true;
        return false
    };
    this.checkBoardDependantControl = function(value) {
        var boardDependantSelectors = ["cb_cf_verify_btn", "cb_cf_flash_btn", "cb_cf_flash_with_prog_btn", "cb_cf_burn_bootloader"];
        if (boardDependantSelectors.indexOf(value) > -1) {
            if (typeof this.selectedBoard == "object") {
                compilerflasher.enableShortCuts = true;
                return true
            }
            return false
        }
        return true
    };
    this.enableBoardDependantControls = function() {
        compilerflasher.enableShortCuts = true;
        $("#cb_cf_verify_btn").removeAttr("disabled");
        if (!this.pluginHandler.plugin_running) return;
        var selectors = ["#cb_cf_flash_btn", "#cb_cf_flash_with_prog_btn", "#cb_cf_burn_bootloader"];
        selectors.forEach(function(selector) {
            $(selector).removeAttr("disabled")
        })
    };
    this.getMaxSize = function() {
        return parseInt(this.selectedBoard["upload"]["maximum_size"])
    };
    this.saveProgrammer = function() {
        var $programmers = $("#cb_cf_programmers");
        lawnchairOperation(function() {
            this.save({
                key: "programmer",
                name: $programmers.find("option:selected").text()
            })
        });
        var oldProgrammer = this.selectedProgrammer.name;
        this.selectedProgrammer = this.programmers_list[$programmers.prop("selectedIndex")];
        var newProgrammer = this.selectedProgrammer.name;
        var actionId = 39;
        var metaData = {
            oldProgrammer: oldProgrammer,
            newProgrammer: newProgrammer,
            tabID: this.pluginHandler.tabID
        };
        createLogCompilerflasher(actionId, metaData)
    };
    this.loadProgrammer = function() {
        var programmersInitInterval = setInterval(function() {
            if (selfCf.pluginHandler.plugin_running) {
                clearInterval(programmersInitInterval);
                lawnchairOperation(function() {
                    this.exists("programmer", function(exists) {
                        if (exists) this.get("programmer", function(config) {
                            $("#cb_cf_programmers").val(config.name)
                        });
                        selfCf.selectedProgrammer = selfCf.programmers_list[$("#cb_cf_programmers").prop("selectedIndex")]
                    })
                }, function() {
                    selfCf.selectedProgrammer = selfCf.programmers_list[$("#cb_cf_programmers").prop("selectedIndex")]
                })
            }
        }, 60)
    };
    this.getDefaultBoard = function() {
        var SearchString = window.location.search.substring(1);
        var VariableArray = SearchString.split("&");
        for (var i = 0; i < VariableArray.length; i++) {
            var KeyValuePair = VariableArray[i].split("=");
            if (KeyValuePair[0] == "board") return decodeURIComponent(KeyValuePair[1])
        }
    };
    this.setBoardsList = function(data) {
        this.boards_list = data
    };
    this.getBoardsList = function() {
        return this.boards_list
    };
    this.clickedBoard = function() {
        var board = $("#cb_cf_boards").find("option:selected").text();
        var actionId = 42;
        var metaData = {
            selectedBoard: board,
            tabID: this.pluginHandler.tabID
        };
        createLogCompilerflasher(actionId, metaData)
    };
    this.clickedProgrammer = function() {
        var programmer = $("#cb_cf_programmers").find("option:selected").text();
        var actionId = 44;
        var metaData = {
            selectedProgrammer: programmer,
            tabID: this.pluginHandler.tabID
        };
        createLogCompilerflasher(actionId, metaData)
    };
    this.generate_payload = function(format, logging) {
        logging = typeof logging == "undefined" ? false : logging;
        var files = this.load_files();
        var files_array = [];
        $.each(files, function(fname, contents) {
            files_array.push({
                filename: fname,
                content: decodeHtml(contents) + "\n"
            })
        });
        var payload = {
            files: files_array,
            format: format,
            version: "105",
            build: compilerflasher.selectedBoard["build"],
            board: this.selectedBoard.name,
            upload: this.selectedBoard.upload
        };
        if (logging) payload["logging"] = logging;
        if (format == "autocomplete" && typeof editor != "undefined" && typeof fileManager != "undefined") {
            payload["position"] = editor.aceEditor.getSession().getSelection().selectionLead.getPosition();
            payload["position"]["file"] = fileManager.openFname;
            payload["archive"] = true
        }
        return JSON.stringify(payload)
    };
    this.getFlashFailMessage = function(error) {
        var msg = "";
        if (window.flashing_errors[error]) msg = window.flashing_errors[error] + " <a href='http://feedback.codebender.cc/knowledgebase/articles/183395-usb-flashing-known-errors' target='_blank'>More Info<\/a>";
        else msg = "An error occurred while connecting to your device. Please try again.";
        return msg
    };
    this.flash_callback = function(from, progress) {
        var actionId;
        var metaData;
        if (progress) {
            var msg = compilerflasher.getFlashFailMessage(progress);
            compilerflasher.setOperationOutput(msg);
            compilerflasher.eventManager.fire("flash_failed", msg, progress);
            if (progress != 0 && (progress > -1 || progress < -23) && progress != -30 && progress != -55 && progress != -56 && progress != -57) {
                actionId = 51;
                metaData = {
                    version: compilerflasher.pluginHandler.codebenderPlugin.version,
                    retVal: progress
                };
                if (selfCf.useApp) compilerflasher.pluginHandler.codebenderPlugin.getFlashResult(function(result) {
                    metaData["flashResult"] = result.substring(0, 1800);
                    createLogCompilerflasher(actionId, metaData)
                });
                else {
                    var result = compilerflasher.pluginHandler.codebenderPlugin.getFlashResult();
                    metaData["flashResult"] = result.substring(0, 1800);
                    createLogCompilerflasher(actionId, metaData)
                }
            }
            if (selfCf.useApp) appDataRateMeter.flashFailAppDataRate()
        } else {
            compilerflasher.eventManager.fire("flash_succeed");
            compilerflasher.setOperationOutput("Upload successful!")
        }
        actionId = 7;
        metaData = {
            return_value: progress,
            tabID: selfCf.pluginHandler.tabID,
            type: selfCf.pluginOrApp,
            port: $("#cb_cf_ports").val(),
            board: selfCf.selectedBoard.name,
            programmer: selfCf.selectedProgrammer.name,
            usingProgrammer: selfCf.usingProgrammer
        };
        createLogCompilerflasher(actionId, metaData);
        window.operationInProgress = false
    };
    this.getHex = function() {
        if (!this.selectedBoard) {
            this.setOperationOutput('<i class="icon-remove"><\/i> Please select a board first.');
            return
        }
        this.eventManager.fire("pre_hex");
        var payload = this.generate_payload("hex");
        var url = generatePath("utilitiesCompile", "/utilities/compile/");
        $.post(url, payload, function(data) {
            try {
                var obj = jQuery.parseJSON(data);
                if (!obj.success) {
                    selfCf.setOperationOutput("Verification failed.");
                    selfCf.eventManager.fire("hex_failed", obj.message)
                } else {
                    selfCf.setOperationOutput("Verification Successful!");
                    selfCf.eventManager.fire("hex_succeed", obj)
                }
            } catch (error) {
                selfCf.eventManager.fire("hex_failed", '<i class="icon-remove"><\/i> Unexpected error occured. Try again later.');
                selfCf.setOperationOutput('<i class="icon-remove"><\/i> Unexpected error occured. Try again later.')
            }
        })
    };
    this.usbflash = function() {
        if (window.operationInProgress || !this.enableShortCuts) return;
        window.operationInProgress = true;
        var actionId = 40;
        this.usingProgrammer = false;
        if (typeof this.selectedBoard.upload.protocol == "undefined") this.usingProgrammer = true;
        var metaData = {
            port: $("#cb_cf_ports").val(),
            board: this.selectedBoard.name,
            programmer: this.selectedProgrammer.name,
            tabID: this.pluginHandler.tabID,
            state: getEditorState(),
            usingProgrammer: this.usingProgrammer
        };
        createLogCompilerflasher(actionId, metaData);
        if (selfCf.useApp && selfCf.isChromeNotSuitableForProgrammers) {
            selfCf.setOperationOutput(selfCf.chromeUpdateForProgrammersMessage);
            selfCf.eventManager.fire("flash_failed", selfCf.chromeUpdateForProgrammersMessage);
            return
        }
        if (!this.pluginHandler.canflash(this.selectedBoard, this.selectedProgrammer)) {
            this.setOperationOutput("Please select a valid port!");
            this.eventManager.fire("plugin_notification", "Please select a valid port!");
            window.operationInProgress = false;
            return
        }
        this.eventManager.fire("pre_flash");
        this.setOperationOutput('<i class="icon-spinner icon-spin"> <\/i> Working...');
        this.getbin(function(obj) {
            if (!obj.success) {
                selfCf.setOperationOutput("There was an error compiling.");
                selfCf.eventManager.fire("verification_failed", obj.message);
                window.operationInProgress = false
            } else {
                selfCf.eventManager.fire("mid_flash", obj.size);
                var actionId, metaData;
                var boardMaxSize = selfCf.getMaxSize();
                if (parseInt(obj.size) > boardMaxSize) {
                    selfCf.setOperationOutput("There is not enough space!");
                    selfCf.eventManager.fire("flash_failed", "There is not enough space!");
                    actionId = 94;
                    metaData = {
                        port: $("#cb_cf_ports").val(),
                        board: selfCf.selectedBoard.name,
                        tabID: selfCf.pluginHandler.tabID,
                        sketchSize: obj.size,
                        boardMaxSize: boardMaxSize,
                        sizeDiff: obj.size - boardMaxSize
                    };
                    createLogCompilerflasher(actionId, metaData);
                    window.operationInProgress = false
                } else if (selfCf.pluginHandler.connected) {
                    selfCf.pluginHandler.disconnect(false);
                    setTimeout(function() {
                        selfCf.pluginHandler.doflash(true, selfCf.selectedBoard, selfCf.selectedProgrammer, obj["output"], selfCf.flash_callback)
                    }, 200)
                } else selfCf.pluginHandler.doflash(true, selfCf.selectedBoard, selfCf.selectedProgrammer, obj["output"], selfCf.flash_callback)
            }
        })
    };
    this.usbflashWithProgrammer = function() {
        if (window.operationInProgress || !this.enableShortCuts) return;
        window.operationInProgress = true;
        this.usingProgrammer = true;
        var actionId = 41;
        var metaData = {
            port: $("#cb_cf_ports").val(),
            board: this.selectedBoard.name,
            programmer: this.selectedProgrammer.name,
            tabID: this.pluginHandler.tabID,
            state: getEditorState()
        };
        createLogCompilerflasher(actionId, metaData);
        if (selfCf.useApp && selfCf.isChromeNotSuitableForProgrammers) {
            selfCf.setOperationOutput(selfCf.chromeUpdateForProgrammersMessage);
            selfCf.eventManager.fire("flash_failed", selfCf.chromeUpdateForProgrammersMessage);
            return
        }
        if (!this.pluginHandler.canflash(this.selectedBoard, this.selectedProgrammer, true)) {
            this.setOperationOutput("Please select a valid port for the programmer!");
            this.eventManager.fire("plugin_notification", "Please select a valid port for the programmer!");
            window.operationInProgress = false;
            return
        }
        this.eventManager.fire("pre_flash");
        this.setOperationOutput('<i class="icon-spinner icon-spin"> <\/i> Working...');
        this.getbin(function(obj) {
            if (!obj.success) {
                selfCf.setOperationOutput("There was an error compiling.");
                selfCf.eventManager.fire("verification_failed", obj.message);
                window.operationInProgress = false
            } else {
                selfCf.eventManager.fire("mid_flash", obj.size);
                var boardMaxSize = selfCf.getMaxSize();
                if (parseInt(obj.size) > boardMaxSize) {
                    selfCf.setOperationOutput("There is not enough space!");
                    selfCf.eventManager.fire("flash_failed", "There is not enough space!");
                    var actionId = 94;
                    var metaData = {
                        port: $("#cb_cf_ports").val(),
                        board: selfCf.selectedBoard.name,
                        programmer: selfCf.selectedProgrammer.name,
                        tabID: selfCf.pluginHandler.tabID,
                        sketchSize: obj.size,
                        boardMaxSize: boardMaxSize,
                        sizeDiff: obj.size - boardMaxSize
                    };
                    createLogCompilerflasher(actionId, metaData);
                    window.operationInProgress = false
                } else if (selfCf.pluginHandler.connected) {
                    selfCf.pluginHandler.disconnect(false);
                    setTimeout(function() {
                        selfCf.pluginHandler.doflash(false, selfCf.selectedBoard, selfCf.selectedProgrammer, obj["output"], selfCf.flash_callback)
                    }, 200)
                } else selfCf.pluginHandler.doflash(false, selfCf.selectedBoard, selfCf.selectedProgrammer, obj["output"], selfCf.flash_callback)
            }
        })
    };
    this.getbin = function(callback) {
        var payload = this.generate_payload("binary");
        var url = generatePath("utilitiesCompile", "/utilities/compile/");
        $.post(url, payload, function(data) {
            try {
                var obj = jQuery.parseJSON(data);
                if (!obj.success) emptyCompilerOutputHandler(obj);
                callback(obj)
            } catch (err) {
                selfCf.setOperationOutput('<i class="icon-remove"><\/i> Unexpected error occurred. Try again later.');
                selfCf.eventManager.fire("verification_failed", '<i class="icon-remove"><\/i> Unexpected error occurred. Try again later.');
                window.operationInProgress = false
            }
        }).fail(function() {
            selfCf.setOperationOutput("Connection to server failed.");
            selfCf.eventManager.fire("verification_failed", "Connection to server failed.");
            window.operationInProgress = false
        })
    };
    this.verify = function() {
        if (window.operationInProgress || !this.enableShortCuts) return;
        window.operationInProgress = true;
        var board = $("#cb_cf_boards").find("option:selected").text();
        var actionId = 47;
        var metaData = {
            selectedBoard: board,
            tabID: this.pluginHandler.tabID,
            state: getEditorState()
        };
        createLogCompilerflasher(actionId, metaData);
        this.eventManager.fire("pre_verify");
        this.setOperationOutput('<i class="icon-spinner icon-spin"> <\/i> Working...');
        this.getbin(function(obj) {
            if (!obj.success) {
                selfCf.setOperationOutput("Verification failed.");
                selfCf.eventManager.fire("verification_failed", obj.message)
            } else {
                selfCf.setOperationOutput("Verification Successful");
                selfCf.eventManager.fire("verification_succeed", obj.size)
            }
            window.operationInProgress = false
        })
    };
    this.burn_bootloader = function() {
        if (!this.pluginHandler.canBurnBootloader(this.selectedProgrammer)) {
            this.setOperationOutput("Please select a valid port!");
            return
        }
        var actionId = 25;
        var metaData = {
            programmer: $("#cb_cf_programmers").find("option:selected").val(),
            board: this.selectedBoard.name,
            port: $("#cb_cf_ports").find("option:selected").val(),
            bootloader_file: typeof this.selectedBoard["bootloader"]["file"] == "undefined" ? "undefined" : this.selectedBoard["bootloader"]["file"],
            type: this.pluginOrApp
        };
        createLogCompilerflasher(actionId, metaData);
        this.setOperationOutput('<i class="icon-spinner icon-spin"><\/i> Working...');
        if (typeof this.selectedBoard["bootloader"]["file"] == "undefined") {
            this.pluginHandler.codebenderPlugin.saveToHex("");
            window.result = this.pluginHandler.doflashBootloader(this.selectedProgrammer, this.selectedBoard)
        } else {
            var url = generatePath("bootloader", "/bootloader/");
            url += this.selectedBoard["bootloader"]["file"].replace(".hex", ".txt");
            $.get(url).success(function(data) {
                selfCf.pluginHandler.codebenderPlugin.saveToHex(data);
                window.result = selfCf.pluginHandler.doflashBootloader(selfCf.selectedProgrammer, selfCf.selectedBoard)
            }).error(function() {
                selfCf.setOperationOutput("The bootloader file was not found.")
            })
        }
    };
    var messageToRestore = "";
    var restoreMessageFlag = false;
    var clearOperationOutputFlag = false;
    this.unsupportedBoard = function(board) {
        if (!this.pluginHandler.plugin_found) return;
        if (selfCf.useApp && board == "TinyLily Mini" && typeof window.isWindowsWithChromeApp == "function" && window.isWindowsWithChromeApp()) {
            var lastMessage;
            var $cbCfOperationOutput = $("#cb_cf_operation_output");
            if ($cbCfOperationOutput.length > 0) lastMessage = $cbCfOperationOutput.text().trim();
            var $operationOutput = $("#operation_output");
            if ($operationOutput.length > 0) lastMessage = $operationOutput.text().trim();
            if (messageToRestore.length == 0) {
                messageToRestore = lastMessage;
                restoreMessageFlag = true
            }
            if (!restoreMessageFlag) clearOperationOutputFlag = true;
            var unsupportedMessage = "The selected board is unsupported at the current platform. We are sorry for the inconvenience.";
            this.setOperationOutput(unsupportedMessage);
            return
        }
        if (restoreMessageFlag) {
            this.setOperationOutput(messageToRestore);
            messageToRestore = "";
            restoreMessageFlag = false;
            return
        }
        if (clearOperationOutputFlag) {
            this.setOperationOutput("");
            clearOperationOutputFlag = false
        }
    };
    var url;
    if ($("#cb_cf_operation_output").length > 0) this.loaded_elements.push("cb_cf_operation_output");
    if ($("button#cb_cf_verify_btn").length > 0) {
        $("#cb_cf_verify_btn").click(function() {
            selfCf.verify()
        });
        this.loaded_elements.push("cb_cf_verify_btn")
    }
    if ($("select#cb_cf_boards").length > 0) {
        this.boardsListExists = true;
        $("#cb_cf_boards").append($("<option><\/option>").html("chargement des cartes...")).attr("disabled", "disabled").click(function() {
            selfCf.clickedBoard()
        }).change(function() {
            selfCf.saveBoard()
        });
		url = generatePath('listBoards', '/board/listboards');
        $.getJSON(url, function(data) {
            boardsListCallback(data)
        });
        this.loaded_elements.push("cb_cf_boards")
    }
    if ($("select#cb_cf_ports").length > 0) {
        var $ports = $("#cb_cf_ports");
        $ports.click(function() {
            selfCf.pluginHandler.clickedPort()
        }).change(function() {
            selfCf.pluginHandler.savePort()
        }).attr("disabled", "disabled");
        if ($ports.data().pluginVersion) this.pluginHandler.minVersion = $ports.data().pluginVersion;
        this.loaded_elements.push("cb_cf_ports")
    }
    if ($("button#cb_cf_flash_btn").length > 0) {
        $("#cb_cf_flash_btn").click(function() {
            selfCf.usbflash()
        }).attr("disabled", "disabled");
        this.loaded_elements.push("cb_cf_flash_btn")
    }
    if ($("select#cb_cf_programmers").length > 0) {
        $("#cb_cf_programmers").append($("<option><\/option>").html("Loading Programmers...")).attr("disabled", "disabled").click(function() {
            selfCf.clickedProgrammer()
        }).change(function() {
            selfCf.saveProgrammer()
        });
        url = generatePath("listProgrammers", "/board/programmers");
        $.getJSON(url, function(data) {
            programmersListCallback(data)
        });
        this.loaded_elements.push("cb_cf_programmers")
    }
    if ($("button#cb_cf_flash_with_prog_btn").length > 0) {
        $("#cb_cf_flash_with_prog_btn").click(function() {
            selfCf.usbflashWithProgrammer()
        }).attr("disabled", "disabled");
        this.loaded_elements.push("cb_cf_flash_with_prog_btn")
    }
    if ($("select#cb_cf_baud_rates").length > 0) {
        var $baudRates = $("#cb_cf_baud_rates");
        $baudRates.append('<option value="9600">9600<\/option>' + '<option value="19200">19200<\/option>' + '<option value="28800">28800<\/option>' + '<option value="38400">38400<\/option>' + '<option value="57600">57600<\/option>' + '<option value="115200">115200<\/option>').attr("disabled", "disabled");
        $baudRates.on("click", function() {
            selfCf.pluginHandler.saveBaudRate()
        });
        selfCf.pluginHandler.loadBaudRate();
        this.loaded_elements.push("cb_cf_baud_rates")
    }
    if ($("button#cb_cf_serial_monitor_connect").length > 0) {
        $("#cb_cf_serial_monitor_connect").click(function() {
            selfCf.pluginHandler.connect()
        }).attr("disabled", "disabled");
        this.loaded_elements.push("cb_cf_serial_monitor_connect")
    }
    var $serialMonitor = $("#cb_cf_serial_monitor");
    if ($serialMonitor.length > 0) {
        var serialMonitorSection = getSerialMonitorSection();
        $serialMonitor.html(serialMonitorSection);
        this.loaded_elements.push("cb_cf_serial_monitor")
    }
    var $burnBootloader = $("#cb_cf_burn_bootloader");
    if ($burnBootloader.length > 0) {
        $burnBootloader.click(function() {
            selfCf.burn_bootloader()
        }).attr("disabled", "disabled");
        this.loaded_elements.push("cb_cf_burn_bootloader")
    }
    this.serial_monitor_disabled = false;
    this.disableCompilerFlasherActions = function() {
        $("#cb_cf_boards").attr("disabled", "disabled");
        $("#cb_cf_verify_btn").attr("disabled", "disabled");
        if (compilerflasher.pluginHandler.plugin_running) {
            $("#cb_cf_ports").attr("disabled", "disabled");
            $("#cb_cf_flash_btn").attr("disabled", "disabled");
            $("#cb_cf_programmers").attr("disabled", "disabled");
            $("#cb_cf_flash_with_prog_btn").attr("disabled", "disabled");
            $("#cb_cf_baud_rates").attr("disabled", "disabled");
            $("#cb_cf_serial_monitor_connect").attr("disabled", "disabled");
            selfCf.serial_monitor_disabled = true
        }
    };
    this.enableCompilerFlasherActions = function() {
        $("#cb_cf_boards").removeAttr("disabled");
        $("#cb_cf_verify_btn").removeAttr("disabled");
        if (compilerflasher.pluginHandler.plugin_running) {
            $("#cb_cf_ports").removeAttr("disabled");
            $("#cb_cf_flash_btn").removeAttr("disabled");
            $("#cb_cf_programmers").removeAttr("disabled");
            $("#cb_cf_flash_with_prog_btn").removeAttr("disabled");
            $("#cb_cf_baud_rates").removeAttr("disabled");
            $("#cb_cf_serial_monitor_connect").removeAttr("disabled");
            selfCf.serial_monitor_disabled = false
        }
    };
    this.on("pre_verify", this.disableCompilerFlasherActions);
    this.on("verification_succeed", this.enableCompilerFlasherActions);
    this.on("verification_failed", this.enableCompilerFlasherActions);
    this.on("pre_flash", this.disableCompilerFlasherActions);
    this.on("flash_failed", this.enableCompilerFlasherActions);
    this.on("flash_succeed", this.enableCompilerFlasherActions);
    this.on("pre_hex", this.disableCompilerFlasherActions);
    this.on("hex_succeed", this.enableCompilerFlasherActions);
    this.on("hex_failed", this.enableCompilerFlasherActions);
    window.operationInProgress = false;
    if (!this.boardsListExists) initPluginOrApp();

    function clientLoader(initializeCallback) {
        var path = generatePath("chromeClient", selfCf.chromeClient);
        var script = document.createElement("script");
        script.async = true;
        document.body.appendChild(script);
        script.onload = function() {
            compilerflasher.pluginHandler.codebenderPlugin = new window.CodebenderPlugin;
            initializeCallback()
        };
        script.onerror = function() {
            compilerflasher.setOperationOutput("There was an unexpected error. Please referesh your browser.")
        };
        script.src = path
    }

    function isCodebenderDomain() {
        return window.location.origin.indexOf("codebender.cc") > -1
    }

    function initializeCompilerflasher() {
        var message = "Searching for plugin ...";
        if (selfCf.useApp) message = "Searching for app ...";
        selfCf.setOperationOutput(message);
        if (selfCf.useApp) {
            appDataRateMeter.clearAllDataRateData();
            appRawDataMeter.scanRawDataRateLogs()
        }
        if (isCodebenderDomain()) window.osBrowserDetectionValidInterval = setInterval(function() {
            if (typeof window.osBrowserIsSupported != "undefined" && typeof window.isSupportedOs != "undefined") {
                clearInterval(window.osBrowserDetectionValidInterval);
                selfCf.pluginHandler.initializePlugin()
            }
        }, 100);
        else selfCf.pluginHandler.initializePlugin()
    }

    function initPluginOrApp() {
        if (isCodebenderDomain()) var useAppInterval = setInterval(function() {
            if (typeof window.useChromeApp === "function" && typeof window.isChrome === "function" && typeof window.isChromeNotSuitableForProgrammers === "function") {
                clearInterval(useAppInterval);
                selfCf.useChrome = window.isChrome();
                if (window.useChromeApp()) {
                    selfCf.pluginOrApp = "app";
                    selfCf.useApp = true;
                    selfCf.isChromeNotSuitableForProgrammers = window.isChromeNotSuitableForProgrammers();
                    clientLoader(initializeCompilerflasher)
                } else initializeCompilerflasher()
            }
        }, 100);
        else initializeCompilerflasher()
    }

    function boardsListCallback(data) {
        var plainList = getPlainBoardList(data);
        compilerflasher.setBoardsList(plainList);
        var $boards = $("#cb_cf_boards");
        $boards.find("option").remove().end();
        var found = false;
        if ($boards.data().board)
            for (var i = 0; i < compilerflasher.boards_list.length; i++)
                if (compilerflasher.boards_list[i]["name"] == $boards.data().board) {
                    $boards.find('option[value=""]').remove();
                    compilerflasher.selectedBoard = compilerflasher.boards_list[i];
                    $boards.hide();
                    found = true;
                    break
                }
        if (!found) {
            $.each(data, function(vendorName, vendorBoards) {
                if (Object.keys(vendorBoards).length != 0) {
                    var optgroup = $("<optgroup>");
                    optgroup.attr("label", vendorName);
                    $.each(vendorBoards, function(index, board) {
                        var option = $("<option><\/option>");
                        option.val(board["name"]).html(board["name"]);
                        optgroup.append(option)
                    });
                    $boards.append(optgroup)
                }
            });
            compilerflasher.loadBoard();
            var board = compilerflasher.getDefaultBoard();
            if (typeof board != "undefined" && $boards.find('option[value="' + board + '"]').length == 1) {
                $boards.val(board);
                compilerflasher.saveBoard()
            }
            $boards.removeAttr("disabled")
        }
        initPluginOrApp()
    }

    function getPlainBoardList(data) {
        var boards = [];
        $.each(data, function(vendorName, vendorBoards) {
            $.each(vendorBoards, function(index, board) {
                boards.push(board)
            })
        });
        return boards
    }

    function programmersListCallback(data) {
        compilerflasher.programmers_list = data;
        var $programmers = $("#cb_cf_programmers");
        $programmers.find("option").remove().end();
        for (var i = 0; i < compilerflasher.programmers_list.length; i++) $programmers.append($("<option><\/option>").val(compilerflasher.programmers_list[i]["name"]).html(compilerflasher.programmers_list[i]["name"]));
        compilerflasher.loadProgrammer()
    }

    function createLogCompilerflasher(actionId, metaData, callback) {
        if (typeof createLog == "function") createLog(actionId, metaData, callback)
    }

    function decodeHtml(html) {
        return html.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    }

    function escapeHtml(html) {
        return html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    }

    function checkObjEquals(a, b) {
        var aProps = Object.getOwnPropertyNames(a);
        var bProps = Object.getOwnPropertyNames(b);
        if (aProps.length != bProps.length) return false;
        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];
            if (a[propName] !== b[propName]) return false
        }
        return true
    }

    function getEditorState() {
        var state = "unknown";
        if (typeof fileManager == "undefined") return state;
        if (checkObjEquals(fileManager.currentState, fileManager.getCurrentState())) state = "clean";
        else state = "dirty";
        fileManager.currentState = fileManager.getCurrentState();
        return state
    }

    function AppDataRateMeter() {
        this.dataMonitor = {};
        this.dataMonitor.rateThreshold = 1e3;
        this.dataRateMeterLog = 96;
        this.dataRateMeterFlashFailedLog = 97;
        var self = this;
        $(window).on("unload", function() {
            self.clearDataRateData()
        })
    }
    AppDataRateMeter.prototype.init = function() {
        this.dataMonitor.sendTic = 0;
        this.dataMonitor.sendToc = 0;
        this.dataMonitor.receivedTic = 0;
        this.dataMonitor.receivedToc = 0;
        this.dataMonitor.secondTic = 0;
        this.dataMonitor.minuteTic = 0;
        this.dataMonitor.bytesTransferred = 0;
        this.dataMonitor.loggedRate = 0;
        this.dataMonitor.maxPeak = 0;
        this.dataMonitor.rateThresholdReached = false
    };
    AppDataRateMeter.prototype.flashFailAppDataRate = function() {
        if (!selfCf.useApp) return;
        var metaData = {
            BpsRate: 0,
            tabID: compilerflasher.pluginHandler.tabID
        };
        var selfParent = this;
        lawnchairOperation(function() {
            var self = this;
            this.keys(function(keys) {
                keys.forEach(function(current) {
                    if (current.indexOf("appDataRate") < 0) return;
                    self.get(current, function(tabSendRate) {
                        if (!tabSendRate || typeof tabSendRate != "object") return;
                        if (tabSendRate.hasOwnProperty("value")) metaData.BpsRate += tabSendRate.value
                    })
                });
                if (metaData.BpsRate >= selfParent.dataMonitor.rateThreshold) {
                    metaData.BpsRate = Math.floor(metaData.BpsRate);
                    createLogCompilerflasher(selfParent.dataRateMeterFlashFailedLog, metaData)
                }
            })
        })
    };
    AppDataRateMeter.prototype.dataRateMeter = function(bufferLength, mode) {
        if (!selfCf.useApp) return;
        var metaData = {
            BpsRate: 0,
            BpsThreshold: this.dataMonitor.rateThreshold,
            tabID: compilerflasher.pluginHandler.tabID,
            tstamp: getTstamp()
        };
        var tic = getTstamp();
        if (this.dataMonitor.minuteTic == 0) this.dataMonitor.minuteTic = tic;
        if (mode == "send" && this.dataMonitor.sendTic == 0) {
            this.dataMonitor.sendTic = tic;
            this.dataMonitor.bytesTransferred = bufferLength;
            return
        }
        if (mode == "received" && this.dataMonitor.receivedTic == 0) {
            this.dataMonitor.receivedTic = tic;
            this.dataMonitor.bytesTransferred = bufferLength;
            return
        }
        if (bufferLength == 0) return;
        var ticTocDiff, rate = 0,
            toc = getTstamp();
        if (mode == "send") {
            this.dataMonitor.sendToc = toc;
            ticTocDiff = this.dataMonitor.sendToc - this.dataMonitor.sendTic;
            this.dataMonitor.sendTic = this.dataMonitor.sendToc;
            rate = this.dataMonitor.bytesTransferred / ticTocDiff * 1e3;
            this.dataMonitor.bytesTransferred = bufferLength
        } else if (mode == "received") {
            this.dataMonitor.receivedToc = toc;
            ticTocDiff = this.dataMonitor.receivedToc - this.dataMonitor.receivedTic;
            this.dataMonitor.receivedTic = this.dataMonitor.receivedToc;
            rate = this.dataMonitor.bytesTransferred / ticTocDiff * 1e3;
            this.dataMonitor.bytesTransferred = bufferLength
        }
        if (rate > this.dataMonitor.rateThreshold) {
            if (!this.dataMonitor.rateThresholdReached) {
                this.dataMonitor.rateThresholdReached = true;
                this.dataMonitor.loggedRate = rate;
                metaData.BpsRate = Math.floor(rate);
                metaData.type = "thresholdReached";
                createLogCompilerflasher(this.dataRateMeterLog, metaData)
            }
            if (rate > this.dataMonitor.maxPeak) this.dataMonitor.maxPeak = rate;
            lawnchairOperation(function() {
                this.save({
                    key: "appDataRate_" + compilerflasher.pluginHandler.tabID,
                    value: Math.floor(rate)
                })
            })
        }
        if (this.dataMonitor.sendToc - this.dataMonitor.minuteTic >= 6e4) {
            if (this.dataMonitor.maxPeak >= this.dataMonitor.loggedRate) {
                metaData.BpsRate = Math.floor(this.dataMonitor.maxPeak);
                metaData.type = "minutePeak";
                createLogCompilerflasher(this.dataRateMeterLog, metaData)
            }
            this.dataMonitor.loggedRate = 0;
            this.dataMonitor.maxPeak = 0;
            this.dataMonitor.minuteTic = this.dataMonitor.sendToc;
            this.dataMonitor.rateThresholdReached = false
        }
    };
    AppDataRateMeter.prototype.clearDataRateData = function() {
        if (!selfCf.useApp) return;
        lawnchairOperation(function() {
            this.remove("appDataRate_" + compilerflasher.pluginHandler.tabID)
        })
    };
    AppDataRateMeter.prototype.clearAllDataRateData = function() {
        if (!selfCf.useApp) return;
        lawnchairOperation(function() {
            var self = this;
            this.keys(function(keys) {
                keys.forEach(function(current) {
                    if (current.indexOf("appDataRate") < 0) return;
                    self.remove(current)
                })
            })
        })
    };

    function AppRawDataMeter() {
        this.lastLogTimestamp = 0;
        this.logPeriod = 1e4;
        this.rawDataLog = 98;
        this.rawDataLogNotSend = 99
    }
    AppRawDataMeter.prototype.storeRawDataMeter = function(messageBytes, timestamp, baudMaxRate, tabID) {
        if (!selfCf.useApp) return;
        var selfParent = this;
        lawnchairOperation(function() {
            var self = this;
            var currentKey = "appRawDataMeter_" + compilerflasher.pluginHandler.tabID;
            this.exists(currentKey, function(exists) {
                function saveState(messageBytesArray) {
                    self.save({
                        key: currentKey,
                        messagesBytes: messageBytesArray,
                        baudMaxRate: baudMaxRate,
                        tabID: tabID
                    }, function() {
                        if (selfParent.lastLogTimestamp == 0 || timestamp - selfParent.lastLogTimestamp >= selfParent.logPeriod) {
                            selfParent.lastLogTimestamp = timestamp;
                            selfParent.logRawDataMeter(currentKey, selfParent.rawDataLog)
                        }
                    })
                }
                var messageBytesArray;
                if (!exists) {
                    messageBytesArray = [{
                        msgSize: messageBytes,
                        tstamp: timestamp
                    }];
                    saveState(messageBytesArray);
                    return
                }
                self.get(currentKey, function(tabRawRate) {
                    if (!tabRawRate || typeof tabRawRate != "object") return;
                    if (tabRawRate.hasOwnProperty("messagesBytes")) messageBytesArray = tabRawRate.messagesBytes.concat({
                        msgSize: messageBytes,
                        tstamp: timestamp
                    });
                    saveState(messageBytesArray)
                })
            })
        })
    };
    AppRawDataMeter.prototype.logRawDataMeter = function(currentKey, actionId) {
        if (!selfCf.useApp) return;
        var metaData = {
            tabID: compilerflasher.pluginHandler.tabID
        };
        lawnchairOperation(function() {
            var self = this;
            this.keys(function(keys) {
                keys.forEach(function(key) {
                    if (key != currentKey) return;
                    self.get(key, function(tabRawRate) {
                        if (!tabRawRate || typeof tabRawRate != "object") return;
                        if (tabRawRate.hasOwnProperty("messagesBytes")) metaData.messagesBytes = tabRawRate.messagesBytes;
                        if (tabRawRate.hasOwnProperty("tabID")) metaData.tabID = tabRawRate.tabID;
                        if (tabRawRate.hasOwnProperty("baudMaxRate")) metaData.baudMaxRate = tabRawRate.baudMaxRate;
                        createLogCompilerflasher(actionId, metaData, function() {
                            self.remove(currentKey)
                        })
                    })
                })
            })
        })
    };
    AppRawDataMeter.prototype.scanRawDataRateLogs = function() {
        if (!selfCf.useApp) return;
        var self = this;
        lawnchairOperation(function() {
            this.keys(function(keys) {
                keys.forEach(function(currentKey) {
                    if (currentKey.indexOf("appRawDataMeter_") < 0) return;
                    self.logRawDataMeter(currentKey, self.rawDataLogNotSend)
                })
            })
        })
    };
    var appDataRateMeter = new AppDataRateMeter;
    var appRawDataMeter = new AppRawDataMeter;

    function getTstamp() {
        return (new Date).getTime()
    }

    function generatePath(codebenderPath, staticPath) {
        if (window.codebender && window.codebender.compilerflasher && window.codebender.compilerflasher.hasOwnProperty(codebenderPath)) return window.codebender.compilerflasher[codebenderPath];
        return generateUrl(staticPath)
    }
    window.generatePath = generatePath;

    function generateUrl(url) {
        return "https://codebender.cc" + url
    }

    function getSerialMonitorSection() {
        var staticSerialMonitorSection = '        <style>\n    #serial_monitor_content {\n        display: none;\n    }\n\n    #serial_hud {\n        overflow-y: auto;\n    }\n\n    #serial_monitor_hud_and_autoscroll {\n        display: inline-block;\n    }\n\n    #serial-checboxes {\n        display: inline-block;\n    }\n\n    #serial-checboxes > label {\n        margin-bottom: 0;\n    }\n\n    #autoscroll_label {\n        position: relative;\n        top: 3px;\n    }\n\n    #autoscroll_check {\n        display: block;\n    }\n\n    #echo_label {\n        position: relative;\n        top: 3px;\n    }\n\n    .serial-monitor-echo {\n        display: inline-block;\n        color: #FF0000;\n    }\n\n    #serial-line-endings {\n        width: 160px;\n        margin: 15px 110px;\n    }\n<\/style>\n\n<div class="serial-monitor-container">\n    <div id="serial_monitor_content">\n        <div id="serial_monitor_hud_and_autoscroll">\n        <span id="serial-checboxes">\n            <label id="autoscroll_label" class="checkbox">\n                <input id=\'autoscroll_check\' type="checkbox" checked>\n                Défilement\n            <\/label>\n\n            <label id="echo_label" class="checkbox">\n                <input id=\'echo_check\' type="checkbox"checked>\n                Echo\n            <\/label>\n        <\/span>\n\n            <select id="serial-line-endings">\n                <option value="nle">Pas de fin de ligne<\/option>\n                <option value="nl">Nouvelle ligne<\/option>\n                <option value="cr">Retour chariot<\/option>\n                <option value="nlcr" selected="selected">Les deux NL & RC<\/option>\n            <\/select>\n        <\/div>\n\n        <div class="input-append">\n            <input size="38" id="text2send" type="text" placeholder="Taper votre texte"\n                   onkeydown="compilerflasher.pluginHandler.serialSendOnEnter(event)">\n            <button id="serial_send" onclick="compilerflasher.pluginHandler.serialSend()" class="btn btn-info " title="Envoyer">\n                Envoyer\n            <\/button>\n        <\/div>\n    <\/div>\n\n    <pre id="serial_hud" class="well"><\/pre>\n<\/div>\n    ';
        if (window.codebender && window.codebender.compilerflasher && window.codebender.compilerflasher.hasOwnProperty("serialMonitorSection")) return window.codebender.compilerflasher.serialMonitorSection;
        return staticSerialMonitorSection
    }

    function lawnchairOperation(callback, errorCallback) {
        if (typeof Lawnchair == "undefined") {
            if (typeof errorCallback == "function") errorCallback();
            return
        }
        try {
            Lawnchair(callback)
        } catch (error) {
            if (typeof errorCallback == "function") errorCallback()
        }
    }

    function emptyCompilerOutputHandler(response) {
        if (response.message.length == 0) {
            var actionId = 20002;
            var metaData = {
                sketchID: window.projectID || "",
                compilerResponse: response
            };
            createLogCompilerflasher(actionId, metaData)
        }
    }
};

function logging() {
    var payload = compilerflasher.generate_payload("binary", true);
    var url = window.generatePath("utilitiesCompile", "/utilities/compile/");
    $.post(url, payload, function(data) {
        var obj = jQuery.parseJSON(data)
    })
}
window.flashing_errors = {
    "-1": "Couldn’t find an Arduino on the selected port. If you are using Leonardo check that you have the correct port selected. If it is correct, try pressing the board’s reset button after initiating the upload.",
    "-2": "There was a problem programming your Arduino. If you are using a non-English Windows version, or username please contact us.",
    "-22": "The selected port seems to be in use. Please check your board connection, and make sure that you are not using it from some other application or you don't have an open serial monitor.",
    "-23": "Another flashing process is still active. Please wait until it is done and try again.",
    "-55": "The specified port might not be available. Please check if it is used by another application. If the problem persists, unplug your device and plug it again.",
    "-56": "The specified port is in use or you do not have enough permissions to use the device. Please check if it is used by another application or correct its permissions.",
    "-57": "The specified port might not be available. Please check if it is used by another application. If the problem persists, unplug your device and plug it again.",
    "-200": "There was a problem during the flashing process. Please make sure you have selected the correct device, close other tabs that may use it, reload the page and try again. If the problem persists, please contact us.",
    "-204": "Could not program your device, the process timed out. Make sure that you have connected it properly, that you have selected the correct settings (device type and port) and try again.",
    1: "Could not connect to your device. Make sure that you have connected it properly, that you have selected the correct settings (device type and port) and try again.",
    100: "Could not connect to your device. Make sure that you have connected it properly, that you have selected the correct settings (device type and port) and try again.",
    126: "Something seems to be wrong with the plugin installation. You need to install the plugin again.",
    127: "Something seems to be wrong with the plugin installation. You need to install the plugin again.",
    256: "Could not connect to your device. Make sure that you have connected it properly, that you have selected the correct settings (device type and port) and try again.",
    1001: "Your device is unresponsive. Please make sure you have selected the correct device and it is connected properly.",
    1002: "Your device is unresponsive. Please make sure you have selected the correct device and it is connected properly.",
    2001: "The selected port seems to be in use. Please make sure that you are not using it from some other program.",
    3005: "This baudrate is not supported by the operating system.",
    2e4: "Your device is unresponsive. Please make sure you have selected the correct device and it is connected properly.",
    20001: "There was a problem during the flashing process. Please make sure you have selected the correct device, close other tabs that may use it, reload the page and try again. If the problem persists, please contact us.",
    20002: "There was a problem during the flashing process. Please make sure you have selected the correct device, close other tabs that may use it, reload the page and try again. If the problem persists, please contact us.",
    20003: "There was a problem during the flashing process. Please make sure you have selected the correct device, close other tabs that may use it, reload the page and try again. If the problem persists, please contact us.",
    20004: "There was a problem during the flashing process. Please make sure you have selected the correct device, close other tabs that may use it, reload the page and try again. If the problem persists, please contact us.",
    20005: "There was a problem during the flashing process. Please make sure you have selected the correct device, close other tabs that may use it, reload the page and try again. If the problem persists, please contact us.",
    20006: "There was a problem during the flashing process. Please make sure you have selected the correct device, close other tabs that may use it, reload the page and try again. If the problem persists, please contact us.",
    20007: "There was a problem during the flashing process. Please make sure you have selected the correct device, close other tabs that may use it, reload the page and try again. If the problem persists, please contact us.",
    20008: "There was a problem during the flashing process. Please make sure you have selected the correct device, close other tabs that may use it, reload the page and try again. If the problem persists, please contact us.",
    20009: "There was a problem during the flashing process. Please make sure you have selected the correct device, close other tabs that may use it, reload the page and try again. If the problem persists, please contact us.",
    20010: "Your device sends data faster than your computer can proccess.",
    20500: "There was a problem during the flashing process. Please make sure you have selected the correct device, close other tabs that may use it, reload the page and try again. If the problem persists, please contact us.",
    32001: "The selected port seems to be in use. Please make sure that you are not using it from some other program.",
    33005: "This baudrate is not supported by the operating system.",
    36e3: "Could not connect to your device. Make sure that you have connected it properly, that you have selected the correct settings (device type and port) and try again."
}