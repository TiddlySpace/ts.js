// version 0.1.2dev
(function() {
var getCSRFToken = function(window) {
	// XXX: should not use RegEx - cf.
	// http://www.quirksmode.org/js/cookies.html
	// https://github.com/TiddlySpace/tiddlyspace/commit/5f4adbe009ed4bda3ce39058a3fb07de1420358d
	var regex = /^(?:.*; )?csrf_token=([^(;|$)]*)(?:;|$)/;
	var match = regex.exec(document.cookie);
	var csrf_token = null;
	if (match && (match.length === 2)) {
		csrf_token = match[1];
	}

	return csrf_token;
};

window.getCSRFToken = getCSRFToken;
})(window);

var ts = {
	locale: {
		error: "An error occurred",
		tryAgain: "Please try again",
		badLogin: "Whoops! We can't log you in with those details. Can you provide some others?",
		charError: "Username is invalid - must only contain lowercase " +
			"letters, digits or hyphens",
		spaceSuccess: "Successfully created space.",
		userError: "Username is already taken, please choose another.",
		passwordError: "Passwords do not match"
	},
	status: {},
	user: {},
	messages: {
		display: function(form, msg, error, options) {
			options = options || {};
			if(options.hideForm) {
				$(".inputArea", form).hide();
			} else {
				$(".inputArea", form).show();
			}
			var msgArea = $(".messageArea", form);
			if(msgArea.length === 0) {
				msgArea = $('<div class="messageArea" />').prependTo(form);
			}
			msgArea.html(msg || ts.locale.error).show(100);
			if(error) {
				msgArea.addClass("error annotation");
			}
			if(options.annotate) {
				$(options.annotate, form).addClass("annotation");
			}
			var container = $("<div />").appendTo(msgArea)[0];
			$("<a />").text(ts.locale.tryAgain).click(function(ev) {
					var form = $("form", $(ev.target).parents());
					ts.messages.reset(form);
				}).appendTo(container);
		},
		reset: function(form) {
			$(".annotation", form).removeClass("annotation");
			$(".messageArea", form).empty().removeClass("error").hide();
			$(".inputArea", form).show();
		}
	},
	isValidSpaceName: function(name) {
		return name.match(/^[a-z][0-9a-z\-]*[0-9a-z]$/) ? true : false;
	},
	init: function(callback) {
		ts.loadHash();
		var register = $("form.registration").addClass("tsInitializing")[0];
		var login = $("form.login").addClass("tsInitializing")[0];
		var logout = $(".logout").addClass("tsInitializing")[0];

		$.ajax({ url: "/status", 
			success: function(status) {
				if(status.identity) {
					ts.register_openid(status.identity);
				}
				$(register).removeClass("tsInitializing");
				$(login).removeClass("tsInitializing");
				$(logout).removeClass("tsInitializing");
				ts.loadStatus(status);
				// do login status
				ts.loginStatus(login, register, logout);
				if(callback) {
					callback();
				}
			}
		});
	},
	loadStatus: function(status) {
		ts.status = status;
		ts.user = {
			name: status.username,
			anon: status.username ? status.username == "GUEST" : true
		};
	},
	getHost: function(subdomain) {
		var s = ts.status;
		var host = s.server_host;
		subdomain = subdomain ? subdomain + "." : "";
		var url = host.scheme + "://" + subdomain + host.host;
		var port = host.port;
		if(port && port !== "80" && port != "443") {
			url += ":" + port;
		}
		return url;
	},
	login: function(username, password, options) {
		var status = ts.status;
		options = options || {};
		var success = options.success || function() {
			window.location = ts.getHost(username);
		};
		var errback = options.errback || function() {};
		var challenger = options.challenger ? options.challenger : "tiddlywebplugins.tiddlyspace.cookie_form";
		var uri = "/challenge/" + challenger;
		$.ajax({ url: uri, type: "POST",
			data: {
				user: username,
				password: password,
				csrf_token: window.getCSRFToken(),
				tiddlyweb_redirect: "/status" // workaround to marginalize automatic subsequent GET
			},
			success: success,
			error: errback
		});
	},
	parameters: {},
	loadHash: function() {
		var args = window.location.hash.substr(1).split("&");
		for(var i = 0; i < args.length; i++) {
			var nameval = args[i].split("=");
			if(nameval.length == 2) {
				ts.parameters[nameval[0]] = nameval[1];
			}
		}
	},
	register_openid: function(openid) {
		var space = ts.parameters.space;
		if(space && openid) {
			var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			var password = "";
			while(password.length < 16) {
				password += possible.charAt(Math.floor(Math.random() * possible.length));
			}
			// register user with username of space and random password
			ts.register(space, password, null, {
				errback: function() {
					throw "failed at step 1/3";
				},
				success: function() {
					// login as that newly created user
					ts.login(space, password, {
						success: function() {
							// map user back to the openid
							var tiddler = new tiddlyweb.Tiddler(name);
							tiddler.bag = new tiddlyweb.Bag("MAPUSER", "/");
							var callback = function(data, status, xhr) {
								// do redirect
								window.location.href = window.location.href;
							};
							var errback = function(r) {
								throw "failed at step 3/3";
							};
							tiddler.put(callback, errback);
						},
						errback: function() {
							throw "failed at step 2/3";
						}
					});
				}
			});
		}
	},
	register: function(username, password, form, options) {
		options = options || {}
		var spaceCallback = options.success || function() {
			ts.messages.display(form, ts.locale.spaceSuccess, true);
			window.location = ts.getHost(username);
		};
		var spaceErrback = function(xhr, error, exc) {
			var msg = xhr.status === 409 ? ts.locale.userError : false; // XXX: 409 unlikely to occur at this point
			ts.messages.display(form, msg, true, options);
		};
		var userCallback = function(resource, status, xhr) {
			ts.login(username, password, {
				success: function(data, status, xhr) {
					var space = new tiddlyweb.Space(username, "/");
					space.create(spaceCallback, spaceErrback);
				}
			});
		};
		var userErrback = function(xhr, error, exc) {
			var msg = xhr.status === 409 ? ts.locale.userError : false;
			ts.messages.display(form, msg, true, options);
		};
		var user = new tiddlyweb.User(username, password, "/");
		user.create(userCallback, userErrback);
	},
	forms: {
		register: function(form, options) {
			options = options || {};
			$('<input type="hidden" name="csrf_token" />').val(window.getCSRFToken()).appendTo(form);
			$(form).submit(function(ev) {
				ev.preventDefault();
				var username = $("[name=username]", form).val();
				var password = $("[name=password]", form).val();
				var passwordConfirm = $("[name=password_confirm]", form).val();
				var validName = ts.isValidSpaceName(username);
				if(validName && password && password === passwordConfirm) { // TODO: check password length?
					ts.register(username, password, ev.target, options);
				} else {
					var msg = validName ? ts.locale.passwordError : ts.locale.charError;
					options.annotate = validName ? "[type=password]" : "[name=username]";
					ts.messages.display(form, msg, true, options);
				}
				return false;
			});
		},
		openid: function(form, options) {
			$('<input type="hidden" name="csrf_token" />').val(window.getCSRFToken()).appendTo(form);
			$(form).attr("method", "post").
				attr("action", "/challenge/tiddlywebplugins.tiddlyspace.openid").
				submit(function(ev) {
				var user = $("input[name=openid]", form).val();
				var space = $("input[name=space]", form).val();
				if(!user) {
					ev.preventDefault();
					return ts.messages.display(form, "Please provide an openid!");
				}
				if(!space) {
					ev.preventDefault();
					return ts.messages.display(form, "Please provide a space name!");
				}
				$('<input name="tiddlyweb_redirect" type="hidden" />').
					val(window.location.pathname + "#openid=" + user + "&space=" + space).appendTo(form);
			});
		},
		logout: function(container) {
			var form = $('<form method="POST" />').attr("action", "/logout").appendTo(container)[0];
			$('<input type="hidden" name="csrf_token" />').val(window.getCSRFToken()).appendTo(form);
			$('<input type="submit" class="button" value="Log out">').appendTo(form);
		},
		login: function(form) {
			// do login
			$('<input type="hidden" name="csrf_token" />').val(window.getCSRFToken()).appendTo(form);
			var options = {
				errback: function(xhr, error, exc) {
					var code = xhr.status;
					if(code == 401) {
						ts.messages.display(form, ts.locale.badlogin, true);
					} else {
						ts.messages.display(form, ts.locale.tryAgain, true);
					}
				}
			};
			$(form).submit(function(ev) {
				var user = $("input[name=username]", form).val();
				var pass = $("input[name=password]", form).val();
				if(!user) {
					return ts.messages.display(form, "Please provide a username!");
				}
				if(!pass) {
					return ts.messages.display(form, "Please provide a password!");
				}
				ts.login(user,
					pass, options);
				ev.preventDefault();
			});
		}
	},
	loginStatus: function(login, register, logout) {
		var status = ts.status;
		var user = ts.user;
		if(!user.anon) {
			$(document.body).addClass("ts-loggedin");
			$([register, login]).remove();
			if(!logout) {
				return;
			}
			$(logout).empty();
			var container = logout;
			var uri = ts.getHost(user.name);
			var link = $("<a />").attr("href", uri).text(user.name)[0];
			$("<span />").text("Welcome back ").appendTo(container);
			$(container).append(link);
			$("<span />").text("!").appendTo(container);
			ts.forms.logout(container);
		} else {
			if(register) {
				ts.forms.register(register);
			}
			if(login) {
				ts.forms.login(login);
			}

			var openid = $("form.ts-openid")[0];
			if(openid) {
				ts.forms.openid(openid);
			}
			$(logout).remove();
		}
	}
};
