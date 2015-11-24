/**
 * External dependencies
 */
import fs from 'fs';
import fspath from 'path';
import request from 'superagent';
import mockery from 'mockery';
import { expect } from 'chai';

/**
 * Test setup
 */
mockery.enable( {
	warnOnReplace: false,
	warnOnUnregistered: false
} );
mockery.registerMock( 'config', {
	isEnabled: () => true
} );
// for speed - the real search index is very large
mockery.registerMock( 'devdocs/search-index', {
	index: {}
} );
mockery.registerMock( 'lunr', {
	Index: {
		load: () => null
	}
} );

/**
 * Internal dependencies
 */
const devdocs = require( '../' );

/**
 * Module variables
 */
function getDocument( base, path, cb ) {
	if ( typeof path === 'function' ) {
		cb = path;
		path = base;
	} else {
		// This mimics what the browser does in this situation
		path = fspath.join( base, path );
	}
	request.get( 'http://localhost:9993/devdocs/service/content' )
		.query( { path: path } )
		.end( ( error, res ) => {
			cb( error, res );
		} );
}

describe( 'devdocs server', () => {
	let app, server;

	before( done => {
		app = devdocs();
		server = app.listen( 9993, done );
	} );

	after( done => {
		mockery.deregisterAll();
		mockery.disable();
		server.close( done );
	} );

	it( 'should return documents', done => {
		getDocument(
			'README.md',
			( err, res ) => {
				expect( err ).to.be.null;
				expect( res.statusCode ).to.equal( 200 );
				expect( res.text ).to.contain( '<a href="CONTRIBUTING.md">' );
				done();
			} );
	} );

	it( 'should return documents with relative paths', done => {
		getDocument(
			'client/components/infinite-list',
			'../../lib/mixins/infinite-scroll/README.md',
			( err, res ) => {
				expect( err ).to.be.null;
				expect( res.statusCode ).to.equal( 200 );
				expect( res.text ).to.contain( '<h1 id="infinite-scroll">' );
				done();
			} );
	} );

	it( 'should return the README.md by default', done => {
		getDocument(
			'client/lib/mixins/infinite-scroll',
			( err, res ) => {
				expect( err ).to.be.null;
				expect( res.statusCode ).to.equal( 200 );
				expect( res.text ).to.contain( '<h1 id="infinite-scroll">' );
				done();
			} );
	} );

	it( 'should not allow viewing files outside the Calypso repo', done => {
		const pathOutsideCalypso = fspath.join( __dirname, '..', '..', '..', '..', 'outside-calypso.md' );
		fs.writeFileSync( pathOutsideCalypso, 'oh no' );
		getDocument(
			'../outside-calypso.md',
			( err, res ) => {
				fs.unlinkSync( pathOutsideCalypso );
				expect( err ).not.to.be.null;
				expect( res.statusCode ).to.equal( 404 );
				expect( res.text ).to.equal( 'File does not exist' );
				done();
			} );
	} );

	it( 'should not allow viewing JavaScript files', done => {
		getDocument(
			'index.js',
			( err, res ) => {
				expect( err ).not.to.be.null;
				expect( res.statusCode ).to.equal( 404 );
				expect( res.text ).to.equal( 'File does not exist' );
				done();
			} );
	} );
} );
