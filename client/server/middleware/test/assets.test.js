/**
 * @jest-environment node
 */
import path from 'path';
import express from 'express';
import mockFs from 'mock-fs';
import nock from 'nock';
import assetsMiddleware from '../assets';

const ASSETS_FILE = path.resolve( __dirname, '../../../../build/assets.json' );

const fileAssets = {
	manifests: [ '/* webpack runtime */' ],
	assets: { 'entry-main': [ '/calypso/entry-main.js', '/calypso/entry-main.css' ] },
};

async function requestAssets( app ) {
	const pages = express();
	pages.use( assetsMiddleware() );
	pages.get( '/', ( req, res ) =>
		res.json( {
			manifests: req.getAssets().manifests,
			entryMain: req.getFilesForChunkGroup( 'entry-main' ),
		} )
	);
	pages.use( ( err, req, res, next ) => res.status( 500 ).json( { error: err.code } ) ); // eslint-disable-line no-unused-vars
	app.use( pages );

	const server = app.listen( 0 );
	try {
		const response = await fetch( `http://localhost:${ server.address().port }/` );
		return { status: response.status, body: await response.json() };
	} finally {
		server.close();
	}
}

describe( 'assets middleware', () => {
	beforeAll( () => nock.enableNetConnect( 'localhost' ) );
	afterAll( () => nock.disableNetConnect() );
	afterEach( () => mockFs.restore() );

	test( 'reads build/assets.json by default', async () => {
		mockFs( { [ ASSETS_FILE ]: JSON.stringify( fileAssets ) } );

		const { status, body } = await requestAssets( express() );

		expect( status ).toBe( 200 );
		expect( body ).toEqual( {
			manifests: [ '/* webpack runtime */' ],
			entryMain: {
				js: [ '/calypso/entry-main.js' ],
				'css.ltr': [ '/calypso/entry-main.css' ],
				'css.rtl': [],
			},
		} );
	} );

	test( 'uses the provider set on the parent app, without reading build/assets.json', async () => {
		mockFs( {} );
		const app = express();
		app.set( 'assets-provider', async () => ( {
			manifests: [],
			assets: { 'entry-main': [ '/client/boot/app.js' ] },
		} ) );

		const { status, body } = await requestAssets( app );

		expect( status ).toBe( 200 );
		expect( body ).toEqual( {
			manifests: [],
			entryMain: { js: [ '/client/boot/app.js' ], 'css.ltr': [], 'css.rtl': [] },
		} );
	} );

	test( 'treats stylesheets served from source, with a query, as CSS', async () => {
		mockFs( {} );
		const app = express();
		app.set( 'assets-provider', () => ( {
			manifests: [],
			assets: { 'entry-main': [ '/client/style.scss?direct', '/client/boot/app.js' ] },
		} ) );

		const { body } = await requestAssets( app );

		expect( body.entryMain ).toEqual( {
			js: [ '/client/boot/app.js' ],
			'css.ltr': [ '/client/style.scss?direct' ],
			'css.rtl': [],
		} );
	} );
} );
