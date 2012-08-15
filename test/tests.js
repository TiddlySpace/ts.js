module("public");

var NOP = function() {};
test("init", function() {
	var res;
	var test = function(ts) {
		res = ts.currentSpace;
	};
	ts.init(test);
	strictEqual(res, "frontpage", "space at frontpage.tiddlyspace.com is frontpage")
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

test("parseParameters parses", function() {
	var queryString = 'foo=5&bar=10',
		res;
	var test = function(ts) {
		res = ts.parseParameters(queryString);
	};

	ts.init(test);

	strictEqual(res.foo, '5', 'foo is 5')
	strictEqual(res.bar, '10', 'bar is 10')
});
