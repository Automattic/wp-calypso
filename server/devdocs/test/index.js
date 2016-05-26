/**
 * External dependencies
 */
import fs from 'fs';
import fspath from 'path';
import request from 'superagent';
import mockery from 'mockery';
import useMockery from 'test/helpers/use-mockery';
import { expect } from 'chai';
import { allowNetworkAccess } from 'test/helpers/nock-control';

/**
 * Internal dependencies
 */
var devdocs;

/**
 * Module variables
 */

const componentsEntries = {
	valid: {
		'components/foo': { count: 10 }
	},
	invalid: {
		'components/foo/docs/': { count: 1 },
		'foo/components/bar': { count: 1 },
		'my-page/index.js': { count: 1 }
	},
	expected: {
		'foo': { count: 10 }
	}
};

function getComponentsUsageStatsMock() {
	return Object.assign( {}, componentsEntries.valid, componentsEntries.invalid );
}

function getComponentsUsageStats( cb ) {
	request.get( 'http://localhost:9993/devdocs/service/components-usage-stats' )
		.end( cb );
}

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

describe( 'devdocs', () => {
	let app, server;

	allowNetworkAccess();
	useMockery();

	before( done => {
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

		mockery.registerMock( 'devdocs/components-usage-stats.json', getComponentsUsageStatsMock() );

		devdocs = require( '../' );
		app = devdocs();
		server = app.listen( 9993, done );
	} );

	after( done => {
		server.close( done );
	} );

	it( 'should return documents', done => {
		getDocument(
			'README.md',
			( err, res ) => {
				expect( err ).to.be.null;
				expect( res.statusCode ).to.equal( 200 );
				expect( res.text ).to.contain( '<a href="./.github/CONTRIBUTING.md">' );
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

	describe( 'components usage stats endpoint', () => {
		it( 'should return stats', done => {
			getComponentsUsageStats( ( err, res ) => {
				expect( err ).to.be.null;
				expect( res.statusCode ).to.equal( 200 );
				expect( res.type ).to.equal( 'application/json' );
				expect( res.body ).not.to.be.empty;
				done();
			} );
		} );

		it( 'should return components stats only', done => {
			getComponentsUsageStats( ( err, res ) => {
				expect( res.body ).to.eql( componentsEntries.expected );
				done();
			} );
		} );
	} );
} );
