/* global describe */
/* global before */
/* global it */
import {expect} from "chai";

import {MY_ARTISTS, GORILLAZ_ID, UNKNOWN_ID} from "./mocks/data";
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
            expect(results).to.be.instanceof(Array).and.have.lengthOf(1);
            expect(results[0]).to.have.property("entity_type", "artist");
            expect(results[0]).to.have.property("name", "Gorillaz");
            expect(results[0]).to.have.property("id", GORILLAZ_ID);
            done();
        }).catch(err => done(err));
    });
    it("getInitialArtists", (done) => {
        var musicgraph = new MusicGraph(MY_ARTISTS, {nbItems: 1});
        musicgraph.getInitialArtists().then(function () {
            expect(musicgraph.similarTo).to.be.instanceof(Array).and.have.lengthOf(1);
            expect(musicgraph.similarTo[0]).to.have.property("externals")
              .with.property("musicgraph")
              .with.property("id");
            done();
        }).catch(err => done(err));
    });
    it("getInitialArtists", (done) => {
        var musicgraph = new MusicGraph(MY_ARTISTS, {nbItems: 1});
        musicgraph.generateArtistPlaylist(GORILLAZ_ID).then(function (results) {
            expect(results).to.be.instanceof(Array).and.have.lengthOf(20);
            expect(results[0]).to.have.property("album_title");
            expect(results[0]).to.have.property("artist_name");
            expect(results[0]).to.have.property("entity_type", "track");
            expect(results[0]).to.have.property("title");
            expect(results[0]).to.have.property("track_album_id");
            expect(results[0]).to.have.property("track_artist_id");
            done();
        }).catch(err => done(err));
    });
    it("generateArtistPlaylist: Invalid artist id", (done) => {
        var musicgraph = new MusicGraph(MY_ARTISTS, {nbItems: 1});
        musicgraph.generateArtistPlaylist("whatever").then(function () {
            done(new Error("Promise should be rejected"));
        }).catch(err => {
            console.log(err);
            expect(err).to.be.an("object");
            expect(err).to.have.property("status").with.property("code", -1);
            done();
        });
    });
    it("generateArtistPlaylist: Unknown artist ID", (done) => {
        var musicgraph = new MusicGraph(MY_ARTISTS, {nbItems: 1});
        musicgraph.generateArtistPlaylist(UNKNOWN_ID).then(function () {
            done(new Error("Promise should be rejected"));
        }).catch(err => {
            console.log(err);
            expect(err).to.be.an("object"),
            expect(err).to.have.property("status").with.property("code", -1);
            done();
        });
    });
    it("generate Playlist: should success", (done) => {
        var musicgraph = new MusicGraph(MY_ARTISTS, {nbItems: 3});
        musicgraph.generate().then(function (results) {
            expect(results).to.be.instanceof(Array).and.have.lengthOf(3);
            results.forEach(item => {   // eslint-disable-line max-nested-callbacks
                expect(item).to.have.property("track");
                expect(item.track).to.have.property("title");
                expect(item.track).to.have.property("artist");
                expect(item.track).to.have.property("externals");
                expect(item.track.externals).to.have.property("spotify").with.property("id");
                expect(item.track.externals).to.have.property("youtube").with.property("id");
                expect(item.track.externals).to.have.property("musicbrainz").with.property("id");
            });
            done();
        }).catch(err => done(err));
    });
/*
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
            expect(results).to.be.instanceof(Array).and.have.lengthOf(3);
            results.forEach(item => {   // eslint-disable-line max-nested-callbacks
                expect(item).to.have.property("track");
                expect(item.track).to.have.property("title");
                expect(item.track).to.have.property("artist");
                expect(item.track).to.have.property("externals");
                expect(item.track.externals).to.have.property("spotify").with.property("id");
                expect(item.track.externals).to.have.property("youtube").with.property("id");
                expect(item.track.externals).to.have.property("musicbrainz").with.property("id");
            });
            done();
        }).catch(err => done(err));
    });*/
});
