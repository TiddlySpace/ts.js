tiddlyweb.routes.identities = "{host}/users/{username}/identities";
var IdentitiesCollection = function(user) {
	tiddlyweb.Collection.apply(this, ["identities", user.host, {
		username: user.username
	}]);
};
IdentitiesCollection.prototype = new tiddlyweb.Collection();
jQuery.extend(IdentitiesCollection.prototype, {
	get: function(callback, errback) {
		var uri = this.route();
		jQuery.ajax({
			type: "get",
			dataType: "json",
			url: uri,
			success: function(uris, status, xhr) {
				callback(uris, status, xhr);
			},
			error: function(xhr, error, exc) {
				errback(xhr, error, exc, self);
			}
		});
	}
});

tiddlyweb.User.prototype.identities = function() {
	return new IdentitiesCollection(this);
}
