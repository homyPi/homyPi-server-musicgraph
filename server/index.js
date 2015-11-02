var moduleManager = require(__base + "modules/ModuleManager");
var routes = require("./musicGraphRoutes");
var PlaylistGenerator = require("./MusicGraph");

module.exports = {
	link: function() {
		var music = moduleManager.get("homyPi-server-music");
		music.addPlaylistSource(PlaylistGenerator, "musicgraph");
	},
	routes: routes,
	config: require("./config")
}
