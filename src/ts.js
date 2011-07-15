// version 0.1.2dev
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
		var loginStatus = $("form.registration").addClass("tsInitializing")[0];
		var login = $("form.login").addClass("tsInitializing")[0];

		$.ajax({ url: "/status", 
			success: function(status) {
				$(loginStatus).removeClass("tsInitializing");
				$(login).removeClass("tsInitializing");
				ts.loadStatus(status);
				// do login status
				ts.loginStatus(loginStatus);
				if(login) {
					ts.forms.login(login);
				}
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
	loginStatus: function(form) {
		var status = ts.status;
		var user = ts.user;
		if(!user.anon) {
			$(document.body).addClass("ts-loggedin");
			if(!form) {
				return;
			}
			var parent = form.parentNode;
			$(parent).empty();
			var container = $("<div />").appendTo(parent);
			var uri = ts.getHost(user.name);
			var link = $("<a />").attr("href", uri).text(user.name)[0];
			$("<span />").text("Welcome back ").appendTo(container);
			$(container).append(link);
			$("<span />").text("!").appendTo(container);
			ts.forms.logout(container);
		} else {
			if(form) {
				ts.forms.register(form);
			}
		}
	}
};
