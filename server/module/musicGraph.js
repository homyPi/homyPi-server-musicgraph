/**
 * Created by nolitsou on 9/5/15.
 */
var MusicGraph = require("./MusicGraph");

/**
 * Get a new Musicgraph playlist
 */
var playlist = function (req, res) {
	'use strict';
	MusicGraph.generatePlaylist(req.user)
		.then(function(playlist) {
			return res.json({playlist: playlist});
		})
		.catch(function(err) {
			return res.json({err: err});
		});
};

module.exports = {
	playlist: playlist
};