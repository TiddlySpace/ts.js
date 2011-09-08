module("public");

test("init", function() {
	var callback = function() {
		
	};
	ts.init(callback);
	strictEqual(ts.currentSpace, false, "no space is defined on a file uri")
});

test("getHost", function() {
	var host;
	var callback = function() {
		host = ts.getHost(false);
	};
	ts.init(callback);
	strictEqual(host, "http://tiddlyspace.com", "when no subdomain given return the full tiddlyspace domain");
});

