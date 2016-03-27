/*  eslint-disable*/
export default {
    config: {
        musicgraph_config: {
            api_key: process.env.HOMYPI_MUSICGRAPH_API_KEY,
            api_url: "http://api.musicgraph.com/api/v2/"
        }
    },
    modules: {
        "homyPi-server-music": {
            addPlaylistSource: function() {}
        }
    }
}
