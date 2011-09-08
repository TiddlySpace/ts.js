module("public");

var NOP = function() {};
test("init", function() {
	ts.init(NOP);
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

test("resolveCurrentSpaceName", function() {
	ts.init(NOP, { space: "foo" });
	strictEqual(ts.currentSpace, "foo", "current space reflects the passed in parameter")
});
