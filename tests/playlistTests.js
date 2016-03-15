/* global describe */
/* global before */
/* global it */
import should from "should";    // eslint-disable-line

import {MY_ARTISTS, GORILLAZ_ID} from "./mocks/data";
let MusicGraph;
import link from "../server/link";

import SharedMock from "./mocks/shared";
import nock from "nock";

/*
import startMongoose from "./mocks/mongoose";
import mongoose from "mongoose";
*/

describe("Playlist", function () {
    this.timeout(150000);

    before(done => {
        link.load(SharedMock);
        MusicGraph = require("../server/module/MusicGraph");
        done();
    });

    it("searchArtist", done => {
        MusicGraph.searchArtist({name: "gorillaz"}).then(function (results) {
            results.should.be.instanceof(Array).and.have.lengthOf(1);
            results[0].should.have.property("entity_type", "artist");
            results[0].should.have.property("name", "Gorillaz");
            results[0].should.have.property("id", GORILLAZ_ID);
            done();
        }).catch(err => done(err));
    });
    it("getInitialArtists", (done) => {
        var musicgraph = new MusicGraph(MY_ARTISTS, {nbItems: 1});
        musicgraph.getInitialArtists().then(function () {
            musicgraph.similarTo.should.be.instanceof(Array).and.have.lengthOf(1);
            musicgraph.similarTo[0].should.have.property("externals")
              .with.property("musicgraph")
              .with.property("id");
            done();
        }).catch(err => done(err));
    });
    it("getInitialArtists", (done) => {
        var musicgraph = new MusicGraph(MY_ARTISTS, {nbItems: 1});
        musicgraph.generateArtistPlaylist(GORILLAZ_ID).then(function (results) {
            results.should.be.instanceof(Array).and.have.lengthOf(20);
            results[0].should.have.property("album_title");
            results[0].should.have.property("artist_name");
            results[0].should.have.property("entity_type", "track");
            results[0].should.have.property("title");
            results[0].should.have.property("track_album_id");
            results[0].should.have.property("track_artist_id");
            done();
        }).catch(err => done(err));
    });
    it("generate Playlist: should success", (done) => {
        var musicgraph = new MusicGraph(MY_ARTISTS, {nbItems: 3});
        musicgraph.generate().then(function (results) {
            results.should.be.instanceof(Array).and.have.lengthOf(3);
            results.forEach(item => {   // eslint-disable-line max-nested-callbacks
                item.should.have.property("track");
                item.track.should.have.property("title");
                item.track.should.have.property("artist");
                item.track.should.have.property("externals");
                item.track.externals.should.have.property("spotify").with.property("id");
                item.track.externals.should.have.property("youtube").with.property("id");
                item.track.externals.should.have.property("musicbrainz").with.property("id");
            });
            done();
        }).catch(err => done(err));
    });
    it("generate Playlist: should succeed even after an error 'too many requests'", (done) => {
        var musicgraph = new MusicGraph(MY_ARTISTS, {nbItems: 3});
        nock("http://api.musicgraph.com")
            .persist()
            .get("/api/v2/playlist")
            .query(true)
            .reply(429, {
                code: 3
            });
        setTimeout(() => {
            nock.cleanAll();
        }, 5000);
        musicgraph.generate().then(function (results) {
            results.should.be.instanceof(Array).and.have.lengthOf(3);
            results.forEach(item => {   // eslint-disable-line max-nested-callbacks
                item.should.have.property("track");
                item.track.should.have.property("title");
                item.track.should.have.property("artist");
                item.track.should.have.property("externals");
                item.track.externals.should.have.property("spotify").with.property("id");
                item.track.externals.should.have.property("youtube").with.property("id");
                item.track.externals.should.have.property("musicbrainz").with.property("id");
            });
            done();
        }).catch(err => done(err));
    });
});
