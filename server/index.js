var routes = require("./module/musicGraphRoutes");
var Link = require("./Link");

module.exports = {
	routes: routes,
	config: require("./config"),
	link: function(moduleManager, Raspberry, MongooseModels, UserMiddleware, config) {
		Link.Raspberry = Raspberry;
		Link.MongooseModels = MongooseModels;
		Link.User = {
			middleware: UserMiddleware
		}
		Link.config = config;
		var PlaylistGenerator = require("./module/MusicGraph");
		var music = moduleManager.get("homyPi-server-music");
		music.addPlaylistSource(PlaylistGenerator, "musicgraph");
	
	}
}
