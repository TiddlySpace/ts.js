var xhr = {
	getResponseHeader: function() {}
};

var _oldAjax = $.ajax;
$.ajax = function(options) {
	var handlers = {
		"GET": {
			"/status": function(options) {
				options.success({"username": "jon", "challengers": [], 
					"server_host": {"host": "tiddlyspace.com", "scheme": "http", "port": "80"}});
			},
			"http://foo.tiddlyspace.com/spaces/foo/members": function(options) {
				options.success(["jon"], "200", xhr);
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
