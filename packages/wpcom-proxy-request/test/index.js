import request, { isCookieAuthMissing, reloadProxy, requestAllBlogsAccess } from '../src';

const PROXY_ORIGIN = 'https://public-api.wordpress.com';

const getProxyWindow = () => document.querySelector( 'iframe' ).contentWindow;

const sendFromProxy = ( data, { origin = PROXY_ORIGIN, source = getProxyWindow() } = {} ) =>
	window.dispatchEvent( new MessageEvent( 'message', { data, origin, source } ) );

describe( 'wpcom-proxy-request', () => {
	let postMessage;

	const sentRequests = () => postMessage.mock.calls.map( ( [ params ] ) => params );
	const lastRequest = () => sentRequests().at( -1 );
	const respond = ( body, statusCode, headers = {} ) =>
		sendFromProxy( [ body, statusCode, headers, lastRequest().callback ] );

	beforeEach( () => {
		reloadProxy();
		postMessage = jest.spyOn( getProxyWindow(), 'postMessage' ).mockImplementation( () => {} );
	} );

	test( 'injects a hidden proxy iframe for the current origin', () => {
		const iframes = document.querySelectorAll( 'iframe' );

		expect( iframes ).toHaveLength( 1 );
		expect( iframes[ 0 ].src ).toBe(
			`${ PROXY_ORIGIN }/wp-admin/rest-proxy/?v=2.0#${ window.location.origin }`
		);
		expect( iframes[ 0 ].style.display ).toBe( 'none' );
	} );

	test( 'buffers requests until the proxy is ready, then sends them to the proxy origin', () => {
		request( { path: '/me' }, () => {} );
		request( { path: '/sites/example.com', method: 'post' }, () => {} );

		expect( postMessage ).not.toHaveBeenCalled();

		sendFromProxy( 'ready' );

		expect( postMessage ).toHaveBeenCalledTimes( 2 );
		expect( postMessage ).toHaveBeenCalledWith(
			expect.objectContaining( {
				path: '/me',
				method: 'GET',
				callback: expect.any( String ),
				supports_args: true,
				supports_error_obj: true,
				supports_progress: true,
			} ),
			PROXY_ORIGIN
		);
		expect( sentRequests()[ 1 ] ).toMatchObject( { path: '/sites/example.com', method: 'POST' } );
	} );

	test( 'sends requests straight away once the proxy is ready', () => {
		sendFromProxy( 'ready' );
		request( { path: '/me' }, () => {} );

		expect( lastRequest() ).toMatchObject( { path: '/me' } );
	} );

	test( 'passes the body and headers of a successful response to the callback', () => {
		const callback = jest.fn();
		sendFromProxy( 'ready' );
		request( { path: '/me' }, callback );

		respond( { ID: 1, username: 'user' }, 200, { 'Content-Type': 'application/json' } );

		expect( callback ).toHaveBeenCalledTimes( 1 );
		expect( callback ).toHaveBeenCalledWith(
			null,
			{ ID: 1, username: 'user' },
			{ 'Content-Type': 'application/json', status: 200 }
		);
	} );

	test( 'resolves the returned promise when no callback is given', async () => {
		sendFromProxy( 'ready' );
		const response = request( { path: '/timezones', apiNamespace: 'wpcom/v2' } );

		respond( { found: 1, timezones: [] }, 200 );

		await expect( response ).resolves.toEqual( { found: 1, timezones: [] } );
	} );

	test( 'passes a WordPress.com error for an unsuccessful response to the callback', () => {
		const callback = jest.fn();
		sendFromProxy( 'ready' );
		request( { path: '/sites/this-site-does-not-exist' }, callback );

		respond( { error: 'unknown_blog', message: 'Unknown blog' }, 404 );

		expect( callback ).toHaveBeenCalledTimes( 1 );
		const [ error, body, headers ] = callback.mock.calls[ 0 ];
		expect( error ).toMatchObject( {
			name: 'UnknownBlogError',
			message: 'Unknown blog',
			statusCode: 404,
		} );
		expect( body ).toBeNull();
		expect( headers ).toEqual( { status: 404 } );
	} );

	test( 'rejects the returned promise for an unsuccessful response', async () => {
		sendFromProxy( 'ready' );
		const response = request( { path: '/sites/example.com/posts/0' } );

		respond( { error: 'unknown_post', message: 'Unknown post' }, 404 );

		await expect( response ).rejects.toMatchObject( {
			name: 'UnknownPostError',
			statusCode: 404,
		} );
	} );

	test( 'ignores messages that are not from the proxy iframe', () => {
		const callback = jest.fn();
		sendFromProxy( 'ready' );
		request( { path: '/me' }, callback );
		const message = [ { ID: 1 }, 200, {}, lastRequest().callback ];

		sendFromProxy( message, { origin: 'https://example.com' } );
		sendFromProxy( message, { source: window } );

		expect( callback ).not.toHaveBeenCalled();
	} );

	test( 'resolves a meta API request when the proxy confirms the update', async () => {
		sendFromProxy( 'ready' );
		const response = requestAllBlogsAccess();

		expect( lastRequest() ).toMatchObject( { metaAPI: { accessAllUsersBlogs: true } } );
		respond( 'metaAPIupdated', undefined );

		await expect( response ).resolves.toBe( 'metaAPIupdated' );
	} );

	test( 'reports when the proxy says the cookie auth is missing', () => {
		expect( isCookieAuthMissing() ).toBe( false );

		sendFromProxy( 'cookie-auth-missing' );

		expect( isCookieAuthMissing() ).toBe( true );
	} );
} );
