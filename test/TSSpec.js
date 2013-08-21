describe("ts.js", function () {

    tiddlyweb.status = {
        "username": "pads",
        "tiddlyspace_version": "1.2.5",
        "space": {
            "recipe": "frontpage_private",
            "name": "frontpage"
        },
        "challengers": ["tiddlywebplugins.tiddlyspace.cookie_form", "tiddlywebplugins.tiddlyspace.openid"],
        "server_host": {
            "host": "tiddlyspace.com",
            "scheme": "http",
            "port": "80"
        },
        "version": "1.4.9"
    };

    describe("Initialisation", function () {

        it("should initialise correctly by obtaining the current space name", function() {
            var res;
            var test = function(ts) {
                res = ts.currentSpace;
            };
            ts.init(test);
            expect(res).toEqual("frontpage");
        });

        it("should be able to get the host URL", function() {
            var host;
            var callback = function(ts) {
                host = ts.getHost(false);
            };
            ts.init(callback);
            expect(host).toEqual("http://tiddlyspace.com");
        });

        it("should be able to resolve the current space name when passed a space name", function() {
            var res;
            var test = function(ts) {
                res = ts.currentSpace;
            };
            ts.init(test, { space: "foo" });
            expect(res).toEqual("foo");
        });

        it("should be able to resolve the current space name to false when passed", function() {
            var res;
            var test = function(ts) {
                res = ts.currentSpace;
            };
            ts.init(test, { space: false });
            expect(res).toEqual(false);
        });

        it("should be able to parse parameters correctly", function() {
            var queryString = "foo=5&bar=10",
                res;
            var test = function(ts) {
                res = ts.parseParameters(queryString);
            };

            ts.init(test);

            expect(res.foo).toEqual("5");
            expect(res.bar).toEqual("10");
        });
    });

    describe("Forms", function() {

        var initialisedTs;

        beforeEach(function () {

            jasmine.getFixtures().fixturesPath = "test/fixtures";
            runs(function() {

                ts.init(function(ts) {
                    initialisedTs = ts;
                });
            });

            waitsFor(function() {
                return initialisedTs !== undefined;
            }, "ts to initialise", 500);
        });

        it("should use the default challenger ", function () {

            loadFixtures("login-form.html");
            var stubbedAjax = sinon.stub($, "ajax");

            initialisedTs.forms.login(document.getElementsByClassName("ts-login")[0]);

            $(".ts-login input[name='username']").val("pads");
            $(".ts-login input[name='password']").val("letmein");
            $(".ts-login").submit();


            sinon.assert.calledWithMatch(stubbedAjax, {
                url: "/challenge/tiddlywebplugins.tiddlyspace.cookie_form"
            });

            stubbedAjax.restore();
        });

        it("should use the challenger specified by the form", function () {

            loadFixtures("login-form-custom-challenger.html");
            var stubbedAjax = sinon.stub($, "ajax");

            initialisedTs.forms.login(document.getElementsByClassName("ts-login")[0]);

            $(".ts-login input[name='username']").val("pads");
            $(".ts-login input[name='password']").val("letmein");
            $(".ts-login").submit();


            sinon.assert.calledWithMatch(stubbedAjax, {
                url: "/challenge/cookie_form"
            });

            stubbedAjax.restore();
        });
    });

});