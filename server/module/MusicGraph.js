/* eslint camelcase:0 */
let config = require("../link").getShared().config;
let request = require("request");
let qs = require("qs");
let winston = require("winston");
// let Q = require("q");
let models = require("../link").getShared().MongooseModels;
let Promise = require("bluebird");
let _ = require("lodash");


let MusicGraph = function (myArtists, options) {
    "use strict";
    this.api = null;
    this.myArtists = myArtists;
    this.options = options;
    this.similarTo = [];

    this.ignoreIds = [];

    this.init = function () {
        return new Promise(function (resolve) {
            resolve();
        });
    };

    this.getInitialArtists = function () {
        return new Promise((resolve, reject) => {
            winston.info("MusicGraph: this.getInitialArtists: START");
            let promises = [];
            var i;
            for (i = 0; i < options.nbItems; i++) {
                promises.push(this.getArtist());
            }
            Promise.all(promises)
                .then(artists => {
                    this.similarTo = artists;
                    winston.info("MusicGraph: this.getInitialArtists: DONE");
                    resolve();
                }).catch(reject);
        });
    };

    this.getArtist = function () {
        return new Promise((resolve, reject) => {
            var i = -1;
            var artist;
            winston.info("MusicGraph: this.getInitialArtists: START");
            while (i === -1 || this.ignoreIds.indexOf(i) !== -1) {
                i = Math.floor(Math.random() * this.myArtists.length - 1);
            }
            artist = this.myArtists[i];
            if (!artist.externals ||
              !artist.externals.musicgraph ||
              !artist.externals.musicgraph.id) {
                MusicGraph.searchArtist({name: artist.name}, { limit: 1})
                    .then(artists => {
                        if (!artists.length) {
                            winston.info("MusicGraph: this.getInitialArtists: " +
                                "Artist not found. Retrying");
                            this.ignoreIds.push(i);
                            this.getArtist().then(resolve).catch(reject);
                        } else {
                            if (!artist.externals) {
                                artist.externals = {};
                            }
                            artist.externals.musicgraph = {
                                id: artists[0].id
                            };
                            winston.info("MusicGraph: this.getInitialArtists: SUCCESS");
                            resolve(artist);
                        }
                    });
            } else {
                resolve(artist);
            }
        });
    };
    this.generateArtistPlaylist = function (artistId) {
        return new Promise((resolve, reject) => {
            var uri = MusicGraph.api_url + "playlist",
                query = {
                    api_key: MusicGraph.api_key,
                    artist_ids: artistId
                };
            if (this.options.tempo) {
                query.tempo = this.options.tempo;
            }
            uri += "?" + qs.stringify(query);
            request({
                uri: uri,
                method: "GET"
            }, function (err, response, body) {
                if (err) {
                    return reject(err);
                }
                return resolve(JSON.parse(body).data);
            });
        });
    };
    this.generate = function () {
        return new Promise((resolve, reject) => {
            winston.info("MusicGraph: this.generate: START");
            this.getInitialArtists()
                .then(() => {
                    winston.info("getInitialArtists");
                    var promises = [];
                    _.forEach(this.similarTo, artist => {
                        promises.push(this.generateArtistPlaylist(artist.externals.musicgraph.id));
                    });
                    Promise.all(promises)
                        .then(results => {
                            var res = results.map(function (data) {
                                if (!data.length) {
                                    return {};
                                }
                                var i = Math.floor(Math.random() * data.length);
                                return {
                                    track: {
                                        title: data[i].title,
                                        artist: data[i].artist_name
                                    }
                                };
                            });
                            this.playlist = res;
                            winston.info("MusicGraph: this.generate: SUCCESS");
                            return resolve(res);
                        }).catch(function (err) {
                            winston.error("MusicGraph: this.generate: ERRORED", err);
                            reject(err);
                        });
                }).catch(function (err) {
                    reject(err);
                });
        });
    };
};

MusicGraph.api_key = config.musicgraph_config.api_key;
MusicGraph.api_url = config.musicgraph_config.api_url;


MusicGraph.searchArtist = function (data) {
    "use strict";
    return new Promise(function (resolve, reject) {
        var uri = MusicGraph.api_url + "artist/search";
        data.api_key = MusicGraph.api_key;
        uri += "?" + qs.stringify(data);
        request({
            uri: uri,
            method: "GET"
        }, function (err, response, body) { //eslint-disable-line
            if (err) {
                return reject(err);
            }
            MusicGraph.responseHandler(body).then(function (MusicGraphResponse) {
                return resolve(MusicGraphResponse.data);
            }).catch(reject);
        });
    });
};

MusicGraph.responseHandler = function (response) {
    "use strict";
    return new Promise(function (resolve, reject) {
        try {
            var json = JSON.parse(response);
            if (json.status && json.status.code !== undefined) {
                if (json.status.code === 0) {
                    return resolve({pagination: json.pagination, data: json.data});
                }
                return reject(json.status);
            }
            winston.warn({type: "api", code: json.status});
            return reject({type: "api", code: json.status});
        } catch (e) {
            winston.info("response = ", response);
            winston.error("error ", e);
            return reject(e);
        }
    });
};


module.exports = MusicGraph;
