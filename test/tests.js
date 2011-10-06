module("public");

var NOP = function() {};
test("init", function() {
	var res;
	var test = function(ts) {
		res = ts.currentSpace;
	};
	ts.init(test);
	strictEqual(res, false, "no space is defined on a file uri")
});

test("getHost", function() {
	var host;
	var callback = function(ts) {
		host = ts.getHost(false);
	};
	ts.init(callback);
	strictEqual(host, "http://tiddlyspace.com", "when no subdomain given return the full tiddlyspace domain");
});

test("resolveCurrentSpaceName", function() {
	var res;
	var test = function(ts) {
		res = ts.currentSpace;
	};
	ts.init(test, { space: "foo" });
	strictEqual(res, "foo", "current space reflects the passed in parameter")
});

test("resolveCurrentSpaceName to false", function() {
	var res;
	var test = function(ts) {
		res = ts.currentSpace;
	};
	ts.init(test, { space: false });
	strictEqual(res, false, "false is recognised as a current space");
});
