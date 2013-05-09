/*global module:false, require:false*/
module.exports = function (grunt) {

    grunt.initConfig({

        jshint: {
            options: {
                bitwise: true,
                //camelcase: true,
                curly: true,
                eqeqeq: true,
                forin: true,
                immed: true,
                indent: 4,
                latedef: true,
                newcap: true,
                noarg: true,
                noempty: true,
                quotmark: "double",
                trailing: true,
                maxlen: 120,
                undef: true,
                unused: true,
                boss: true,
                browser: true,
                sub: true,
                globals: {
                    jQuery: true,
                    tiddlyweb: true,
                    ts: true
                }
            },
            gruntfile: {
                src: "Gruntfile.js"
            },
            srcFiles: {
                src: ["src/*.js"]
            },
            testFiles: {
                src: ["test/*.js"]
            }
        },
        jasmine: {
            test: {
                src: ["src/chrjs.identities.js", "src/ts.js"],
                options: {
                    vendor: ["lib/jquery.min.js", "lib/jquery-json.min.js", "lib/chrjs.js", "lib/chrjs-users.js",
                        "lib/chrjs-space.js"],
                    helpers: [],
                    specs: "test/*Spec.js",
                    template: require("grunt-template-jasmine-istanbul"),
                    templateOptions: {
                        coverage: "tmp/coverage/coverage.json",
                        report: "tmp/coverage"
                    },
                    keepRunner: true
                }
            }
        },
        clean: ["lib", "tmp"],
        curl: {
            "lib/chrjs-space.js": "https://raw.github.com/TiddlySpace/tiddlyspace/master/src/lib/chrjs.space.js",
            "lib/chrjs-users.js": "https://raw.github.com/tiddlyweb/chrjs/master/users.js",
            "lib/chrjs.js": "https://raw.github.com/tiddlyweb/chrjs/master/main.js",
            "lib/jquery.min.js": "http://tiddlyspace.com/bags/common/tiddlers/jquery.js",
            "lib/jquery-json.min.js": "http://jquery-json.googlecode.com/files/jquery.json-2.2.min.js"
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jasmine");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-curl");

    grunt.registerTask("test", ["jshint", "jasmine"]);

    grunt.registerTask("default", ["curl", "test"]);
};
