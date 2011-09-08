clean:
	rm -rf src/jquery-json.min.js
	rm -rf src/chrjs.js
	rm -rf src/chrjs-space.js
	rm -rf src/chrjs-users.js
	rm -rf src/jquery.min.js

remotes: clean
	curl -o src/chrjs-space.js \
		https://raw.github.com/TiddlySpace/tiddlyspace/master/src/lib/chrjs.space.js
	curl -o src/chrjs-users.js \
		https://raw.github.com/tiddlyweb/chrjs/master/users.js
	curl -o src/chrjs.js \
		https://raw.github.com/tiddlyweb/chrjs/master/main.js
	curl -o src/jquery.min.js \
		http://code.jquery.com/jquery-1.6.1.min.js
	curl -o src/jquery-json.min.js \
		http://jquery-json.googlecode.com/files/jquery.json-2.2.min.js
