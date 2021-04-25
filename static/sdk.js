/**
 * Sphere Engine Compilers JavascriptSDK.
 *
 * @file API to manage SECWidget
 * @author Sphere Research Development Team
 * @version 1.0.0
 * 
 * @license Sphere Research Labs (sphere-research.com)
 */

 (function(window){
	
    /**
     * @constructor
     */
    var SEC = function() {
        
    	console.log('SECW SDK version: ' + this.version)
    	
        this.initialized = false;
        
        this.widgets = [];
        
        this.count = 0;
        this.scroll = false;
        this.released = false;
        
        // set default host when not defined before
        if (typeof SEC_BASE === 'undefined') {
            SEC_BASE = 'compilers.widgets.sphere-engine.com';
        }
        
        // use HTTPS by default
        if (typeof SEC_HTTPS === 'undefined') {
            SEC_HTTPS = true;
        }
        
        // finds widget by given ID
        this._widget = function(id) {
            
            var widget = null;
            for (var i = 0; i < this.widgets.length; i++) {
                if (this.widgets[i].id === id) {
                    widget = this.widgets[i];
                    break;
                }
            }
            
            return widget;
        };
        
        this.create = function(index, element) {
            
            if (element.getAttribute('data-height')) {
            	element.style.height = element.getAttribute('data-height') + 'px';
            } else {
            	element.style.height = '100%';
            }
            element.style.minHeight = '300px';
        	
            var id = element.getAttribute('data-id');
            if (id == null || id == '') {
                id = element.getAttribute('id') != null && element.getAttribute('id') != '' ? element.getAttribute('id') : 'sec-widget-' + (index + 1);
            }

            element.setAttribute('id', id);

            var iframe = document.createElement('iframe');
            iframe.setAttribute('id', id);
            iframe.src = (SEC_HTTPS ? 'https' : 'http') + '://' + SEC_BASE + '/' + escape(element.getAttribute('data-widget')) + '?place_id=' + escape(id) + '&sdk=1';
            
            if (element.getAttribute('data-signature') != null) {
            	iframe.src = iframe.src + '&se_signature=' + escape(element.getAttribute('data-signature'));
            }
            
            if (element.getAttribute('data-nonce') != null) {
            	iframe.src = iframe.src + '&se_nonce=' + escape(element.getAttribute('data-nonce'));
            }
            
            if (element.getAttribute('data-theme') != null) {
                iframe.src = iframe.src + '&se_theme=' + escape(element.getAttribute('data-theme'));
            }
            
            if (element.getAttribute('data-custom-data') != null) {
            	var customData = element.getAttribute('data-custom-data');
                iframe.src = iframe.src + '&custom_data=' + escape(customData).substr(0, 256);
            }
            
            if (element.getAttribute('data-width')) {
                iframe.style.width = element.getAttribute('data-width') + 'px';
            } else {
                iframe.style.width = '100%';
            }

            if (element.getAttribute('data-height')) {
                iframe.style.height = element.getAttribute('data-height') + 'px';
            } else {
                iframe.style.height = '100%';
            }

            iframe.style.border = 'none';
            iframe.style.overflow = 'scroll';
            iframe.style.minHeight = '300px';
            iframe.style.minWidth = '500px';

            iframe.frameborder = 0;
            
            var _SEC = this;
            iframe.addEventListener('load', function() {
                var widget = _SEC.widget(id);
                widget.prepared = true;
            });
            
            this.widgets.push(new SECWidget(id, iframe));
        };
        
        var _SEC = this;
        this.handler = function() {
            
            _SEC.scroll = true;
        };
        
        // add handler to the scroll listener
        window.addEventListener('scroll', _SEC.handler, true);
        
        // add handler to the resize listener
        window.addEventListener('resize', _SEC.handler, true);
        
        this.ready(function() {
        	_SEC.init();      	
        });
	};
	
    /**
     * @constructor
     */
	var SECWidget = function(id, iframe) {
        
        this.id = id;
        this.iframe = iframe;
        
        this.loaded = false;
        this.prepared = false;
        
        // checks the widget is visible on the screen
        this.visible = function() {
            
            var element = document.getElementById(this.id);
            var rectangle = element.getBoundingClientRect();
            var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
            
            return !(rectangle.bottom < 0 || rectangle.top - viewHeight >= 0);
        };
        
        // store functions to execute after IFRAME loads
        this.ready = function(f) {
        
            if (this.prepared) {
                f();
            } else {
                this.iframe.addEventListener('load', f);
            }
        };
        
        this.events = new SECWidgetEvents(this);
        /* TO REDESIGN
        this.toolbar = new SECWidgetToolbar(this);
        */
	};
    
    /**
     * @constructor
     */
    var SECWidgetEvents = function(widget) {
    
        this.widget = widget;
		this.functions = [];
        
        // executes callbacks for given event
        this.execute = function (eventName, eventData) {

            var result = true;
            var functions = this.callbacks(eventName);

            var i = 0;
            for (i = 0; i < functions.length; i++) {
                result = result && functions[i].callback(eventData);
            }

            return result;
        };
        
        this.exists = function (eventName, callback) {

            var found = false;
            var functions = this.callbacks(eventName);

            var i = 0;
            for (i = 0; i < functions.length; i++) {
                if (functions[i].callback === callback) {
                    found = true;
                    break;
                }
            }

            return found;
        };
        
        // finds callbacks for given event
        this.callbacks = function (eventName) {

            var callbacks = this.functions.filter(function(currentValue, index){
                return currentValue.name === eventName;
            });

            return callbacks;
        };
	};
    
    /**
     * @type Array
     */
    SECWidgetEvents.events = [
        'enterFullScreen', 'exitFullScreen', 'beforeSendSubmission', 'afterSendSubmission', 'checkStatus'
    ];
	
    /**
     * @constructor
     */
	var SECWidgetEventsItem = function() {
        
		this.name = null;
		this.callback = null;
	};
    
    /**
     * @constructor
     */
	/* TO REDESIGN
    var SECWidgetToolbar = function(widget) {
        
        this.widget = widget;
    };
    */
	
    SEC.prototype.debug = false;
    
    SEC.prototype.version = '1.0.0';

    /**
     * @type SECWidgetEvents
     */
	SECWidget.prototype.events;
    
    /**
     * @type SECWidgetToolbar
     */
	/* TO REDESIGN
    SECWidget.prototype.toolbar;
    */
    
    /**
     * Initializes the SDK.
     * 
     * - creates widgets based on the DOM
     * - assigns the message listener to fetch data
     * - starts monitoring the visibility of created widgets
     */
    SEC.prototype.init = function() {
        
        if (!this.initialized) {
            
            // create widgets based on DOM
            var widgets = document.getElementsByClassName('sec-widget');
            
            if (widgets.length <= 0) {
            	SECUtils.log('warn', null, 'widgets not found');
            }
            
            for (var i = 0; i < widgets.length; i++) {
                this.create(i, widgets[i]);
            }

            var _SEC = this;
            
            // assign message listener
            window.addEventListener('message', function(event) { 
                
                if (event.origin.indexOf(SEC_BASE) >= 0) {
                    var widget = _SEC._widget(event.data.id);
                    if (widget !== null) {
                        switch (event.data.event) {
                            case 'enterFullScreen':
                                widget.iframe.style.position = 'fixed';
                                widget.iframe.style.top = 0;
                                widget.iframe.style.left = 0;
                                widget.iframe.style.zIndex = 3000;
                                
                                widget.events.execute('enterFullScreen', event.data.data);
                                widget.iframe.contentWindow.postMessage({event: 'enterFullScreen', result: true}, '*');
                                break;
                            case 'exitFullScreen':
                                widget.iframe.style.padding = '0';
                                widget.iframe.style.position = 'static';
                                widget.iframe.style.zIndex = 'auto';

                                widget.events.execute('exitFullScreen', event.data.data);
                                widget.iframe.contentWindow.postMessage({event: 'exitFullScreen', result: true}, '*');
                                break;
                            case 'beforeSendSubmission':
                                var result = widget.events.execute('beforeSendSubmission', event.data.data);
                                widget.iframe.contentWindow.postMessage({event: 'beforeSendSubmission', result: result}, '*');
                                break;
                            case 'afterSendSubmission':
                                widget.events.execute('afterSendSubmission', event.data.data);
                                break;
                            case 'checkStatus':
                                widget.events.execute('checkStatus', event.data.data);
                                break;
                        }
                    }
                }
            }, false);
            
            this.initialized = true;
			
			SECUtils.log('info', null, 'init', window.SEC.debug);
            
            this.load(); // load after initializind
            this.monitor(); // starts the visibility monitoring
		} else {
			SECUtils.log('warn', null, 'SDK has been already initialized');
		}
	};

    /**
     * Loads widgets.
     * 
     * - loads widgets visible on the screen 
     * - takes care of the delay when loading first widget
     */
    SEC.prototype.load = function() {
        
        for (var i = 0; i < this.widgets.length; i++) {
            
            if (!this.widgets[i].loaded && this.widgets[i].visible()) {
                
                this.count++;  
                this.widgets[i].load();
                
                if (!this.released) {
                    
                    // load next widgets when first is ready
                    var _SEC = this;
                    this.widgets[i].iframe.onload = function() {
                        _SEC.load();
                    }
                    
                    this.released = true; // release loading next widgets
                    break;
                }
            }   
        }
    };
    
    /**
     * Collects function to be executed when SDK is initialized.
     * 
     * - executes the function when SDK is ready
     * - waits with the execution for the SDK initialization
     */
	SEC.prototype.ready = function(f) {
        
		if (document.readyState != 'loading' && document.readyState != 'interactive') {
            f();
        } else {
            window.addEventListener('load', f);
        }
	};
	
    /**
     * Gets the widget.
     * 
     * @param {String} id the ID of the widget
     * 
     * @return {SECWidget}|null
     */
    SEC.prototype.widget = function(id) {
        
        if (SECUtils.areEmpty([id])) {
            SECUtils.log('error', null, '"id" must be specified');
            return;
        }
        
        var _SEC = this;
        var widget = this._widget(id);
        if (typeof widget !== 'undefined' && widget !== null) {
            SECUtils.log('info', null, 'widget', window.SEC.debug);
            return widget;
        }
        
    	// get div with widget by ID or data-id attribute
    	element = document.getElementById(id);
        if (element == null) {
            element = document.querySelector('[data-widget][data-id="'+id+'"]');
        }
    	
        if (element == null) {
        	SECUtils.log('error', null, 'there is no widget with given ID');
            return null;
        }
        
        // create a widget
        this.create(id, element);
        
        // load the widget
        widget = this._widget(id);
        widget.load();
        
        SECUtils.log('info', null, 'widget', window.SEC.debug);
        return widget;
    };
    
    /**
     * Runs the monitoring.
     * 
     * - loads the widgets when scrolling/resizing
     * - removes the listeners when all widgets are loaded
     */
    SEC.prototype.monitor = function() {
        
        var _SEC = this;
        var monitorInterval = setInterval(function(){
            
            // load when user is scrolling/resizing
            if (_SEC.scroll) {
                
                _SEC.load();
                _SEC.scroll = false;
                
                if (_SEC.widgets.length === _SEC.count) {
                    
                    // stop monitoring
                    clearInterval(monitorInterval);
                    
                    // remove listeners
                    window.removeEventListener('scroll', _SEC.handler);
                    window.removeEventListener('resize', _SEC.handler);
                }
            }
        }, 200);
    };
    
    /**
     * Loads the widget.
     * 
     * - finds the element in DOM
     * - replaces by inserting the IFRAME
     */
    SECWidget.prototype.load = function () {
        
        var widget = document.getElementById(this.id);
        
        // replace element with the IFRAME
        widget.parentNode.replaceChild(this.iframe, widget);
        this.loaded = true;
        
        SECUtils.log('info', 'widget', 'load', window.SEC.debug);
    };
    
    /**
     * Configures the widget.
     * 
     * - loads code
     * - creates toolbar
     * - chooses compilers
     * 
     * @param {Object} options options to configure widget with
     */
    SECWidget.prototype.config = function (options) {
        
        var _widget = this;
        this.ready(function() {
            if (typeof options.code !== 'undefined') {
                _widget.loadSourceCode(options.code.compiler, options.code.source, options.code.input);
            }

            /* TO REDESIGN
            if (typeof options.toolbar !== 'undefined' && typeof options.toolbar.groups !== 'undefined') {       
                for (var i = 0; i < options.toolbar.groups.length; i++) {
                    var group = options.toolbar.groups[i];
                    _widget.toolbar.createButtonGroup(group.id, group.buttons);
                }
            }
            */

            if (typeof options.compilers !== 'undefined') {
                _widget.setCompilers(options.compilers.list, options.compilers.selected);
            }
            
            SECUtils.log('info', 'widget', 'config', window.SEC.debug);
        });
    };
    
    /**
     * Loads source code.
     * 
     * @param {Number} codeCompiler the ID of compiler
     * @param {String} codeSource source code
     * @param {String} codeInput input data
     */
    SECWidget.prototype.loadSourceCode = function (codeCompiler, codeSource, codeInput) {
        
        var _widget = this;
        this.ready(function() {
            _widget.iframe.contentWindow.postMessage({event: 'loadSourceCode', data: {
                compiler: typeof codeCompiler !== 'undefined' ? codeCompiler : null,
                source: typeof codeSource !== 'undefined' ? codeSource : null,
                input: typeof codeInput !== 'undefined' ? codeInput : null
            }}, '*');
        
            SECUtils.log('info', 'widget', 'load source code', window.SEC.debug);
        });
    };
    
    /**
     * Loads code.
     * 
     * @deprecated use loadSourceCode
     * @param {Number} codeCompiler the ID of compiler
     * @param {String} codeSource source code
     * @param {String} codeInput input data
     */
    SECWidget.prototype.loadCode = function (codeCompiler, codeSource, codeInput) {
        
    	this.loadSourceCode(codeCompiler, codeSource, codeInput);
    };
    
    /**
     * Sets compilers. 
     * 
     * @param {Array} compilersList list of compilers numbers
     */
    SECWidget.prototype.setCompilers = function (compilersList) {
        
        var _widget = this;
        this.ready(function() {
            _widget.iframe.contentWindow.postMessage({event: 'setCompilers', data: {
                list: typeof compilersList !== 'undefined' ? compilersList : null
            }}, '*');
        
            SECUtils.log('info', 'widget', 'set compilers', window.SEC.debug);
        });
    };
    
    /**
     * Sets compilers. 
     * 
     * @deprecated use setCompilers
     * @param {Array} compilersList list of compilers numbers
     */
    SECWidget.prototype.chooseCompilers = function (compilersList) {
        
        this.setCompilers(compilersList);
    };
    
    /**
     * Subscribes a callback.
     * 
     * @param {String} event name
     * @param {function} callback to execute when event triggers
     */
	SECWidgetEvents.prototype.subscribe = function (eventName, eventCallback) {
        
        if (SECUtils.areEmpty([eventName, eventCallback])) {
            SECUtils.log('error', 'widget.events', '"eventName", "eventCallback" must be specified');
            return;
        }
        
        // check the eventName is correct
        if (SECWidgetEvents.events.indexOf(eventName) === -1) {
            SECUtils.log('error', 'widget.events', eventName + ' event does not exists');
            return;
        }
        
        // check for callbacks duplication
        if (this.exists(eventName, eventCallback)) {
            SECUtils.log('warn', 'widget.events', 'this callback has been already subscribed for ' + eventName);
            return;
        }
        
		var event = new SECWidgetEventsItem();
		
		event.name = eventName;
		event.callback = eventCallback;
		
		this.functions.push(event);
        
        SECUtils.log('info', 'widget.events', 'subscribe', window.SEC.debug);
	};
    
    /**
     * Unsubscribes a callback.
     * 
     * @param {String} event name
     * @param {function} callback to remove from the execution list
     */
	SECWidgetEvents.prototype.unsubscribe = function (eventName, eventCallback) {
        
        if (SECUtils.areEmpty([eventName, eventCallback])) {
            SECUtils.log('error', 'widget.events', '"eventName", "eventCallback" must be specified');
            return;
        }
        
        // check the eventName is correct
        if (SECWidgetEvents.events.indexOf(eventName) === -1) {
            SECUtils.log('error', 'widget.events', eventName + ' event does not exists');
            return;
        }
        
        var eventIndex = null;
        for (var i = 0; i < this.functions.length; i++) {
            if (this.functions[i].name === eventName && this.functions[i].callback === eventCallback) {
                eventIndex = i;
            }
        }
        
        // given eventCallback is not subscribed
        if (eventIndex === null) {
            SECUtils.log('warn', 'widget.events', 'specified callback does not exists');
            return;
        }
		
		this.functions.splice(eventIndex, 1);
        
        SECUtils.log('info', 'widget.events', 'unsubscribe', window.SEC.debug);
	};
    
    /**
     * Creates a button.
     * 
     * @param {String} groupId ID of the group to assign created button
     * @param {String} buttonId button ID
     * @param {String} buttonIcon icon name (from "fontawesome" collection)
     * @param {String} buttonType design type (default, primary, success, warning, danger)
     * @param {String} buttonTooltip message to show on mouse over button
     * @param {function} buttonCallback callback to execute on click on button
     */
	/* TO REDESIGN
    SECWidgetToolbar.prototype.createButton = function (groupId, buttonId, buttonIcon, buttonType, buttonTooltip, buttonCallback) {
        
        if (SECUtils.areEmpty([groupId, buttonId, buttonIcon])) {
            SECUtils.log('error', 'widget.toolbar', '"groupId", "buttonId", "buttonIcon" must be specified');
            return;
        }
        
        var _widget = this.widget;
        this.widget.ready(function() {
            _widget.iframe.contentWindow.postMessage({event: 'createToolbarButton', data: {
                id: buttonId,
                icon: buttonIcon,
                type: typeof buttonType !== 'undefined' ? buttonType : null,
                tooltip: typeof buttonTooltip !== 'undefined' ? buttonTooltip : null,
                callback: typeof buttonCallback !== 'undefined' ? encodeURI(buttonCallback) : null,
                group: {
                    id: groupId
                },
            }}, '*');
        
            SECUtils.log('info', 'widget.toolbar', 'create button', window.SEC.debug);
        });
    };
    */
    
    /**
     * Deletes the button.
     * 
     * @param {String} buttonId ID of the button to delete
     */
	/* TO REDESIGN
    SECWidgetToolbar.prototype.deleteButton = function (buttonId) {
        
        if (SECUtils.areEmpty([buttonId])) {
            SECUtils.log('error', 'widget.toolbar', '"buttonId" must be specified');
            return;
        }
        
        var _widget = this.widget;
        this.widget.ready(function() {
            _widget.iframe.contentWindow.postMessage({event: 'deleteToolbarButton', data: {
                id: buttonId,
            }}, '*');
        
            SECUtils.log('info', 'widget.toolbar', 'delete button', window.SEC.debug);
        });
    };
    */
    
    /**
     * Creates a button group.
     * 
     * @param {String} groupId group ID
     * @param {Array} groupButtons the list of buttons to create in created group
     */
	/* TO REDESIGN
    SECWidgetToolbar.prototype.createButtonGroup = function (groupId, groupButtons) {
        
    	groupButtons = typeof groupButtons !== 'undefined' ? groupButtons : [];
    	
        if (SECUtils.areEmpty([groupId])) {
            SECUtils.log('error', 'toolbar', '"groupId" must be specified');
            return;
        }
        
        var _widget = this.widget;
        this.widget.ready(function() {
            
            // prepare parameters in groupButtons
            for (var i = 0; i < groupButtons.length; i++) {
                groupButtons[i] = {
                    id: groupButtons[i].id,
                    icon: groupButtons[i].icon,
                    type: typeof groupButtons[i].type !== 'undefined' ? groupButtons[i].type : null,
                    tooltip: typeof groupButtons[i].tooltip !== 'undefined' ? groupButtons[i].tooltip : null,
                    callback: typeof groupButtons[i].callback !== 'undefined' ? encodeURI(groupButtons[i].callback) : null,
                }
            }

            _widget.iframe.contentWindow.postMessage({event: 'createToolbarButtonGroup', data: {
                id: groupId,
                buttons: groupButtons,
            }}, '*');
        
            SECUtils.log('info', 'widget.toolbar', 'create button group', window.SEC.debug);
        });
    };
    */
    
    /**
     * Deletes the button group.
     * 
     * @param {String} groupId ID of the group to delete
     */
	/* TO REDESIGN
    SECWidgetToolbar.prototype.deleteButtonGroup = function (groupId) {
        
        if (SECUtils.areEmpty([groupId])) {
            SECUtils.log('error', 'toolbar', '"groupId" must be specified');
            return;
        }
        
        var _widget = this.widget;
        this.widget.ready(function() {
            _widget.iframe.contentWindow.postMessage({event: 'deleteToolbarButtonGroup', data: {
                id: groupId,
            }}, '*');
        
            SECUtils.log('info', 'widget.toolbar', 'delete button group', window.SEC.debug);
        }); 
    };
    */
    
    var SECUtils = {};
    
    /**
     * Logs a SDK message.
     * 
     * @param {String} type log type (info, warn, error)
     * @param {String} module SDK module name
     * @param {String} message message to log to the console
     * @param {Boolean} should the log message be displayed?
     */
    SECUtils.log = function(type, module, message, display) {
		if (typeof display === "undefined" || display === null) { 
			display = true; 
		}
		if (!display) {
			return;
		}
    	
        var log = 'SEC';
        if (module !== null) {
            log = log + ' [' + module + ']';
        }
        
        log = log + ': ' + message;
        switch (type) {
            case 'info':
                console.info(log);
                break;
            case 'warn':
                console.warn(log);
                break;
            case 'error':
                console.error(log);
                break;
        }
    };
    
    /**
     * Checks params are empty.
     * 
     * @param {Array} params the list of params to check
     * @param {String} module SDK module name
     * @param {String} message message to log to the console
     * 
     * @return {Boolean} true when all params are set, false otherwise
     */
    SECUtils.areEmpty = function(params) {
        
        var result = false;
        for (var i = 0; i < params.length; i++) {
            if (typeof params[i] === 'undefined' || params[i] === null) {
                result = true;
            }
        };

        return result;
    };
    
	window.SEC = new SEC();
	 
})(window, undefined);