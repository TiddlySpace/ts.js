var _oldAjax = $.ajax;
$.ajax = function(options) {
	var handlers = {
		"GET": {
			"/status": function(options) {
				options.success({"username": "jon", "challengers": [], 
					"server_host": {"host": "tiddlyspace.com", "scheme": "http", "port": "80"}});
			}
		}
	};
	var type = options.type || "GET";
	if (options && handlers[type] && handlers[type][options.url]) {
		handlers[type][options.url](options);
	} else {
		_oldAjax.apply(this, arguments);
	}
};
