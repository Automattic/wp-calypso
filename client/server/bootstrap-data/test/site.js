import { IncomingMessage } from 'http';
import config from '@automattic/calypso-config';
import nock from 'nock';
import getBootstrappedSite from '../site';

jest.mock( '@automattic/calypso-config', () => {
	const impl = jest.fn();
	impl.isEnabled = jest.fn();
	return impl;
} );

const mockRequest = ( { cookies = {}, headers = {}, path = '/' } = {} ) => {
	return Object.assign( new IncomingMessage(), {
		body: {},
		cookies,
		query: {},
		params: {},
		originalUrl: path,
		path,
		get: jest.fn().mockImplementation( ( key ) => headers[ key ] ),
	} );
};

const authCookies = { wordpress_logged_in: 'auth-cookie' };

const mockSiteFetch = ( { slug, response = { ID: 1, slug } } = {} ) =>
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ encodeURIComponent( slug ) }` )
		.query( true )
		.reply( 200, response );

const mockSiteFetchError = ( { slug, status = 500 } = {} ) =>
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ encodeURIComponent( slug ) }` )
		.query( true )
		.reply( status, {} );

const withConfig = ( keys ) => {
	config.mockImplementation( ( key ) => keys[ key ] );
};

/**
 * These tests rely on nock to intercept the requests and return a pre-defined response.
 *
 * Unlike the user bootstrap, `getBootstrappedSite()` catches all errors and returns
 * `null` rather than re-throwing, so tests assert on the resolved value instead of
 * on thrown errors.
 */
describe( 'Site bootstrap', () => {
	let consoleErrorSpy;

	beforeEach( () => {
		withConfig( {
			wpcom_calypso_rest_api_key: 'key',
		} );
		consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.resetAllMocks();
		consoleErrorSpy.mockRestore();
	} );

	it( 'returns null if there is no auth cookie', async () => {
		const request = mockRequest( { cookies: {} } );

		await expect(
			getBootstrappedSite( request, Promise.resolve( { primary_blog: 99 } ) )
		).resolves.toBeNull();
	} );

	it( 'fetches the site from the URL path when present', async () => {
		mockSiteFetch( { slug: 'example.wordpress.com' } );
		const request = mockRequest( {
			cookies: authCookies,
			path: '/sites/example.wordpress.com',
		} );

		const site = await getBootstrappedSite( request, Promise.resolve( {} ) );

		expect( site ).toEqual( { ID: 1, slug: 'example.wordpress.com' } );
	} );

	it( 'extracts only the first path segment after /sites/', async () => {
		mockSiteFetch( { slug: 'example.wordpress.com' } );
		const request = mockRequest( {
			cookies: authCookies,
			path: '/sites/example.wordpress.com/settings/general',
		} );

		const site = await getBootstrappedSite( request, Promise.resolve( {} ) );

		expect( site ).toEqual( { ID: 1, slug: 'example.wordpress.com' } );
	} );

	it( 'falls back to user.most_recent_blog when no URL slug', async () => {
		mockSiteFetch( { slug: '42', response: { ID: 42 } } );
		const request = mockRequest( { cookies: authCookies, path: '/overview' } );

		const site = await getBootstrappedSite(
			request,
			Promise.resolve( { most_recent_blog: 42, primary_blog: 7 } )
		);

		expect( site ).toEqual( { ID: 42 } );
	} );

	it( 'falls back to user.primary_blog when no most_recent_blog', async () => {
		mockSiteFetch( { slug: '99', response: { ID: 99 } } );
		const request = mockRequest( { cookies: authCookies, path: '/overview' } );

		const site = await getBootstrappedSite( request, Promise.resolve( { primary_blog: 99 } ) );

		expect( site ).toEqual( { ID: 99 } );
	} );

	it( 'returns null when there is no URL slug, no most_recent_blog, and no primary_blog', async () => {
		const request = mockRequest( { cookies: authCookies, path: '/overview' } );

		const site = await getBootstrappedSite( request, Promise.resolve( {} ) );

		expect( site ).toBeNull();
	} );

	it( 'returns null when the site fetch from the URL path fails', async () => {
		mockSiteFetchError( { slug: 'example.wordpress.com' } );
		const request = mockRequest( {
			cookies: authCookies,
			path: '/sites/example.wordpress.com',
		} );

		const site = await getBootstrappedSite( request, Promise.resolve( {} ) );

		expect( site ).toBeNull();
	} );

	it( 'returns null when the user fallback site fetch fails', async () => {
		mockSiteFetchError( { slug: '99' } );
		const request = mockRequest( { cookies: authCookies, path: '/overview' } );

		const site = await getBootstrappedSite( request, Promise.resolve( { primary_blog: 99 } ) );

		expect( site ).toBeNull();
	} );

	it( 'sends the authenticated request to the sites endpoint', async () => {
		const scope = nock( 'https://public-api.wordpress.com', {
			reqheaders: {
				// Hardcoded value resulting from hashing "key" + "auth-cookie"
				Authorization: 'X-WPCALYPSO 26be6ad9e36fde3770b1e81a559db109',
				cookie: ( cookie ) => cookie.includes( 'wordpress_logged_in=auth-cookie' ),
			},
		} )
			.get( '/rest/v1.1/sites/example.wordpress.com' )
			.query( true )
			.reply( 200, { ID: 1 } );
		const request = mockRequest( {
			cookies: authCookies,
			path: '/sites/example.wordpress.com',
		} );

		await getBootstrappedSite( request, Promise.resolve( {} ) );

		expect( scope.isDone() ).toBe( true );
	} );
} );
