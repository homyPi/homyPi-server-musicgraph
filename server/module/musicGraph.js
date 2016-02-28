/**
 * Created by nolitsou on 9/5/15.
 */
let MusicGraph = require("./MusicGraph");

/**
 * Get a new Musicgraph playlist
 * @param {object} req express request object
 * @param {object} res express res object
 * @returns {null} none
 */
let playlist = function (req, res) {
    "use strict";
    MusicGraph.generatePlaylist(req.user)
      .then(function (newPlaylist) {
          return res.json({playlist: newPlaylist});
      })
      .catch(function (err) {
          return res.json({err: err});
      });
};

module.exports = {
    playlist: playlist
};
