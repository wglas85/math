var helpers = {
		
	parseQuery: function(s) {
		
		opts = s.split('&');
		
		var ret = {};
		
		for (var i=0;i<opts.length;++i) {
			
			kv = opts[i].split('=',2);
			
			var key = kv[0];
			
			if (key) {
				
				var value = kv.length>1 ? decodeURIComponent(kv[1]) : null;
				
				ret[key] = value;
			}
			
		}
		
		return ret;
	},

	Deferred: function(cancelFunction) {
		this.successHandlers = [];
		this.failHandlers = [];
		cancelFunction && (this.cancelFunction = cancelFunction);
	},

	xhr: function(args) {

		var url = args.url;
		var method = args.method || ((args.body || args.jsonBody) ? 'POST' : 'GET');


		var xmlhttp = new XMLHttpRequest();

		var d = new helpers.Deferred(function(){xmlhttp.abort();});

		xmlhttp.onreadystatechange=function() {
			if (xmlhttp.readyState==4) {

				if (xmlhttp.status==200) {

					if (xmlhttp.response == null) {
						d.reject("HTTP query ["+method+" "+url+"] returned empty response.");
					}
					else if (!xmlhttp.responseType && args.responseType == 'json' && typeof xmlhttp.response == 'string') {
						d.resolve(JSON.parse(xmlhttp.response));
					}
					else {
						d.resolve(xmlhttp.response);
					}
				}
				else {
					d.reject("HTTP query ["+method+" "+url+"] failed with code "+xmlhttp.status);
				}
			}
		};
		xmlhttp.open(method,url,true);
		if (args.jsonBody) {
			xmlhttp.setRequestHeader("Content-Type","application/json");
			xmlhttp.send(JSON.stringify(args.jsonBody));
		}
		else if (args.body) {
			xmlhttp.send(body);
		}
		else {
			xmlhttp.send();
		}
		if (args.responseType) {
			xmlhttp.responseType = args.responseType;
		}
		return d;
	}
};

helpers.Deferred.prototype.then = function(successHandler,failHandler) {

	successHandler && this.successHandlers.push(successHandler);
	failHandler && this.failHandlers.push(failHandler);
}

helpers.Deferred.prototype.resolve = function() {

	for (var i=0;i<this.successHandlers.length;++i) {
		this.successHandlers[i].apply(this,arguments);
	}
}

helpers.Deferred.prototype.reject = function() {

	for (var i=0;i<this.failHandlers.length;++i) {
		this.failHandlers[i].apply(this,arguments);
	}
}
helpers.Deferred.prototype.cancel = function() {

	this.cancelFunction && this.cancelFunction();
}
