jest.mock( 'config', () => ( {
	isEnabled: () => true,
} ) );
jest.mock( 'devdocs/components-usage-stats.json', () => ( {
	'components/foo': { count: 10 },
	'components/foo/docs/': { count: 1 },
	'foo/components/bar': { count: 1 },
	'my-page/index.js': { count: 1 },
} ), { virtual: true } );
jest.mock( 'devdocs/search-index', () => ( {
	index: {},
} ), { virtual: true } );
jest.mock( 'lunr', () => ( {
	Index: {
		load: () => null,
	},
} ) );

/**
 * External dependencies
 */
import fs from 'fs';
import fspath from 'path';
import request from 'superagent';

/**
 * Module variables
 */
const componentsEntries = {
	valid: {
		'components/foo': { count: 10 },
	},
	invalid: {
		'components/foo/docs/': { count: 1 },
		'foo/components/bar': { count: 1 },
		'my-page/index.js': { count: 1 },
	},
	expected: {
		foo: { count: 10 },
	},
};

function getComponentsUsageStats( cb ) {
	request.get( 'http://localhost:9993/devdocs/service/components-usage-stats' ).end( cb );
}

function getDocument( base, path, cb ) {
	if ( typeof path === 'function' ) {
		cb = path;
		path = base;
	} else {
		// This mimics what the browser does in this situation
		path = fspath.join( base, path );
	}
	request
		.get( 'http://localhost:9993/devdocs/service/content' )
		.query( { path: path } )
		.end( ( error, res ) => {
			cb( error, res );
		} );
}

describe( 'devdocs', () => {
	let app, devdocs, server;

	beforeAll( done => {
		devdocs = require( '../' );
		app = devdocs();
		server = app.listen( 9993, done );
	} );

	afterAll( done => {
		server.close( done );
	} );

	it( 'should return documents', done => {
		getDocument( 'README.md', ( err, res ) => {
			expect( err ).toBeNull();
			expect( res.statusCode ).toBe( 200 );
			expect( res.text ).toContain( '<a href="./.github/CONTRIBUTING.md">' );
			done();
		} );
	} );

	it( 'should return documents with relative paths', done => {
		getDocument(
			'client/components/infinite-list',
			'../../lib/mixins/infinite-scroll/README.md',
			( err, res ) => {
				expect( err ).toBeNull();
				expect( res.statusCode ).toBe( 200 );
				expect( res.text ).toContain( '<h1 id="infinite-scroll">' );
				done();
			}
		);
	} );

	it( 'should return the README.md by default', done => {
		getDocument( 'client/lib/mixins/infinite-scroll', ( err, res ) => {
			expect( err ).toBeNull();
			expect( res.statusCode ).toBe( 200 );
			expect( res.text ).toContain( '<h1 id="infinite-scroll">' );
			done();
		} );
	} );

	it( 'should not allow viewing files outside the Calypso repo', done => {
		const pathOutsideCalypso = fspath.join(
			__dirname,
			'..',
			'..',
			'..',
			'..',
			'outside-calypso.md'
		);
		fs.writeFileSync( pathOutsideCalypso, 'oh no' );
		getDocument( '../outside-calypso.md', ( err, res ) => {
			fs.unlinkSync( pathOutsideCalypso );
			expect( err ).not.toBeNull();
			expect( res.statusCode ).toBe( 404 );
			expect( res.text ).toBe( 'File does not exist' );
			done();
		} );
	} );

	it( 'should not allow viewing JavaScript files', done => {
		getDocument( 'index.js', ( err, res ) => {
			expect( err ).not.toBeNull();
			expect( res.statusCode ).toBe( 404 );
			expect( res.text ).toBe( 'File does not exist' );
			done();
		} );
	} );

	describe( 'components usage stats endpoint', () => {
		it( 'should return stats', done => {
			getComponentsUsageStats( ( err, res ) => {
				expect( err ).toBeNull();
				expect( res.statusCode ).toBe( 200 );
				expect( res.type ).toBe( 'application/json' );
				expect( res.body ).toEqual( componentsEntries.expected );
				done();
			} );
		} );
	} );
} );
