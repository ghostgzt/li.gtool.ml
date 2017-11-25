
var FlashHelper_version = 1;

function $() {
  var elements = new Array();

  for (var i = 0; i < arguments.length; i++) {
    var element = arguments[i];
    if (typeof element == 'string')
      element = document.getElementById(element);

    if (arguments.length == 1)
      return element;

    elements.push(element);
  }

  return elements;
}


/**************************************** FlashHelper ***************************************************/

var FlashHelper = new Object();
FlashHelper.height = 0;
FlashHelper.width = 0;

FlashHelper.shouldWaitForFlash = function() {
// todo: should return 3 values: installed, notInstalled, silentInstall


}

FlashHelper.isFlashInstalled = function() {
    var ret;
    
    if (typeof(this.isFlashInstalledMemo) != "undefined") { return this.isFlashInstalledMemo; }
    
    if (typeof(ActiveXObject) != "undefined") {
        try {
            var ieObj = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
        } catch (e) { }
        ret = (ieObj != null);
    } else {
        var plugin = navigator.mimeTypes["application/x-shockwave-flash"];
        ret = (plugin != null) && (plugin.enabledPlugin != null);
    }
    
    this.isFlashInstalledMemo = ret;

    return ret;
}

FlashHelper.getFlash = function() {
    //var flash = (navigator.appName.indexOf ("Microsoft") !=-1)?window["storage"]:document["storage"];
    return $("storage");
}

FlashHelper.checkFlash = function() {
    // confirm that the Flash Storage is running
    
    try {
        return (this.getFlash().ping() == "pong");
    }
    catch (e) { return false; }
}

FlashHelper.writeFlash = function(s) {
    var swfName = s?s:"ajaxcdr.swf"; 
       
    if (window.ActiveXObject && !FlashHelper.isFlashInstalled())
    {
        // browser supports ActiveX
        // Create object element with 
        // download URL for IE OCX
        document.write('<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"');
        document.write(' codebase="http://download.macromedia.com');
        document.write('/pub/shockwave/cabs/flash/swflash.cab#version=8,5,0,0"');
        document.write(' height="' + this.height + '" width="' + this.width + '" id="storage">');
        document.write(' <param name="movie" value="' + swfName + '">');
        document.write(' <param name="quality" value="high">');
        document.write(' <param name="swliveconnect" value="true">');
        document.write('<\/object>');
    }
    else
    {
        // browser supports Netscape Plugin API

        document.write('<object id="storage" data="' + swfName + '"');
        document.write(' type="application/x-shockwave-flash"');
        document.write(' height="' + this.height + '" width="' + this.width + '">');
        document.write('<param name="movie" value="' + swfName + '">');
        document.write('<param name="quality" value="high">');
        document.write('<param name="swliveconnect" value="true">');
        document.write('<param name="pluginurl" value="http://www.macromedia.com/go/getflashplayer">');
        document.write('<param name="pluginspage" value="http://www.macromedia.com/go/getflashplayer">');
        document.write('<p>You need Flash for this.');  
        document.write(' Get the latest version from');
        document.write(' <a href="http://www.macromedia.com/software/flashplayer/">here<\/a>.');
        document.write('<\/p>');
        document.write('<\/object>'); 
    }
}


FlashHelper.addLoadEvent = function(func) {
  var oldonload = window.onload;
  
  if (typeof window.onload != 'function') {
    window.onload = func;
  } else {
    window.onload = function() {
      oldonload();
      func();
    }
  }
}


FlashHelper.load = function() {
    if (typeof(FlashHelper.onload) != "function") { return; } 

    if (FlashHelper.isFlashInstalled()) {
        // if we expect Flash to work, wait for both flash and the document to be loaded
        var finishedLoading = this.flashLoaded && this.documentLoaded;
        if (!finishedLoading) { return; }
    }
    // todo: cancel timer
    
    var fs = FlashHelper.getFlash();
    
    if ((!FlashHelper.isFlashInstalled() || this.flashLoaded) && fs) {
        if (FlashHelper.checkFlash()) {
            callAppOnLoad(fs);
        } else {
            callAppOnLoad(null);
        }
    } else {
        callAppOnLoad(null);
    }
    
    function callAppOnLoad(fs) {
        if (FlashHelper.onloadCalled) { return; } // todo: figure out why this case gets hit
        FlashHelper.onloadCalled = true;
        FlashHelper.onload(fs);
    }
}

function storageOnLoad() { 
    //alert("storageOnLoad"); 
    FlashHelper.flashLoaded = true;
    FlashHelper.load();
}

function storageOnError() {
    //alert("storageOnError"); 
    FlashHelper.flashLoaded = true;
    FlashHelper.load();
}

FlashHelper.init = function() {
    this.flashLoaded = false;
    this.documentLoaded = false;

    // attach to the window.onload event
    this.addLoadEvent(onload);
  
    function onload() {
        //alert("Flash window.onload");
        if (FlashHelper.isFlashInstalled()) {
            // todo: set a timer
            //setTimeout(storageOnError, 60000);
        }

        FlashHelper.documentLoaded = true;
        FlashHelper.load();
    }
}

FlashHelper.init();


/**************************************** CallbackManager ***************************************************/

var CallbackManager = new Object();
CallbackManager.callbacks = new Array();

// assigns and returns a unique callback name for the input callback
CallbackManager.registerCallback = function(callback) {
    // todo: could be improved (look for the first available spot in the callbacks table, if necessary, expand it)
    var length = this.callbacks.push(selfDeleteCallback);
    var callbackID = length - 1;
    
    return "CallbackManager.callbacks[" + callbackID + "]";
    
    function selfDeleteCallback(obj) {
        delete CallbackManager.callbacks[callbackID];
        setTimeout(function() { callback(obj); }, 0);
        return;
    } 
}

/**************************************** FlashXmlHttpRequest ***************************************************/

var FlashXMLHttpRequest = function() {
    var self = this;
    var _method, _url, _contentType = null;
    var _headers = new Array();
    
    // responseXML 
    // status 
    
    this.open = function(method, url, async, user, password) { 
        _method = method;
        _url = url;
    }
    this.send = function(body) {
        var fs = FlashHelper.getFlash();
        
        function callback(varName) {
            var response = FlashHelper.getFlash().GetVariable(varName);
            self.responseText = response;
            
            if (self.onload) {
                self.onload();
            }
        }

        fs.XmlHttp(_url, CallbackManager.registerCallback(callback), _method, body, _contentType, _headers);
    }
    
    this.setRequestHeader = function(header, value) {
        if (header.toLowerCase() == "Content-Type".toLowerCase()) {
            _contentType = value;
            return;
        }
        
        _headers.push(header);
        _headers.push(value);
    }
    
    this.getRequestHeader = function() {
    }
    this.getResponseHeader = function(a) { alert("not supported"); }
    this.getAllResponseHeaders = function() { alert("not supported"); }
    this.abort = function() { alert("not supported"); }
    this.addEventListener = function(a, b, c) { alert("not supported"); }
    this.dispatchEvent = function(e) { alert("not supported"); }
    this.openRequest = function(a, b, c, d, e) { this.open(a, b, c, d, e); }
    this.overrideMimeType = function(e) { alert("not supported"); }
    this.removeEventListener = function(a, b, c) { alert("not supported"); }
    
   /*
   xmlhttp.setRequestHeader(
'Content-Type',
'application/x-www-form-urlencoded; charset=UTF-8'
);
*/
}

/**************************** PHP to Javascript Project *****************************/
function js_substr( f_string, f_start, f_length ) {
    // *       example 1: js_substr('abcdef', 0, -1);
    // *       returns 1: 'abcde'
    // *       example 2: js_substr(2, 0, -6);
    // *       returns 2: ''
 
    f_string += '';
 
    if(f_start < 0) {
        f_start += f_string.length;
    }
 
    if(f_length == undefined) {
        f_length = f_string.length;
    } else if(f_length < 0){
        f_length += f_string.length;
    } else {
        f_length += f_start;
    }
 
    if(f_length < f_start) {
        f_length = f_start;
    }
 
    return f_string.substring(f_start, f_length);
}

function js_strpos( haystack, needle, offset){
    // *     example 1: js_strpos('Kevin van Zonneveld', 'e', 5);
    // *     returns 1: 14
 
    var i = (haystack+'').indexOf( needle, offset ); 
    return i===-1 ? false : i;
}

function js_strtoupper( str ) {
    // *     example 1: strtoupper('Kevin van Zonneveld');
    // *     returns 1: 'KEVIN VAN ZONNEVELD'
 
    return (str+'').toUpperCase();
}

/**************************** AjaxCrossDomainRequest(url, method) *****************************/
FlashHelper.onload = startApp;

function startApp(fs) {
    if (!fs) { /*alert("Flash not loaded"); */return; }
    //fs.Debug();
}

var AjaxCrossDomainResponse = "";
var AjaxCrossDomainResname = "";
function displayResponse() {
    AjaxCrossDomainResponse = FlashHelper.getFlash().GetVariable("retText");
	if (AjaxCrossDomainResponse){
	    //eval(AjaxCrossDomainResname);
		AjaxCrossDomainResname&&AjaxCrossDomainResname(AjaxCrossDomainResponse);
	}
}

function AjaxCrossDomainRequest(url, method, formname, callback) {
    method = js_strtoupper(method);
	
	AjaxCrossDomainResname = callback;

    var contentType = "application/x-www-form-urlencoded";
    var body = '';
	if(formname){
		var form=document.forms[formname];
		
		for(var i=0;i<form.length;i++){
			//如果是单选按钮、复选框、单选下拉框
			if (form.elements[i].type == "radio" || form.elements[i].type == "checkbox" || form.elements[i].type == "select" ) {
				if(form.elements[i].checked && form.elements[i].name != ""){
					body += encodeURI(form.elements[i].name) + '=' + encodeURI(form.elements[i].value) + '&';
				}
			}
			//如果是多选下拉框
			else if (form.elements[i].type == "select-multiple" && form.elements[i].name != "") {
				for(var sm=0;sm<form.elements[i].length;sm++){
					if(form.elements[i][sm].selected) {
						body += encodeURI(form.elements[i].name) + '=' + encodeURI(form.elements[i][sm].value) + '&';
					}
				}
			}
			//Button、Hidden、Password、Submit、Text、Textarea等文本类型
			else {
				if (form.elements[i].name != "") {
					body += encodeURI(form.elements[i].name) + '=' + encodeURI(form.elements[i].value) + '&';
				}
			}
		}
	}else{
		body="";
	}
    var fs = FlashHelper.getFlash();
    //fs.loadPolicyFile("http://domain/blah/crossdomain.xml");

	if (js_substr(body, -1, 1) == "&"){
	    body = js_substr(body, 0, -1);
	}
	
	if (method == "GET"){
		//GET请求方式
		var urlget = "";
		if (js_substr(url, -1, 1) == "?"){
			urlget = url + body;
		}
		else if(js_strpos(url, "?") > 0 && js_strpos(url, "=") > 0){
			urlget = url + "&" + body;
		}
		else {
		    urlget = url + "?" + body;
		}
        fs.XmlHttp(urlget, "displayResponse", method, "", contentType);
	} else {
		//POST请求方式
        fs.XmlHttp(url, "displayResponse", method, body, contentType);
	}
}

FlashHelper.writeFlash(AjaxCrossFlashFile);
