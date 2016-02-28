var Shared;

module.exports = {
    load: function (AppShared) {
        Shared = AppShared;
        var PlaylistGenerator = require("./module/MusicGraph");
        var music = Shared.modules["homyPi-server-music"];
        music.addPlaylistSource(PlaylistGenerator, "musicgraph");
    },
    getShared: function () {
        return Shared;
    }
};
