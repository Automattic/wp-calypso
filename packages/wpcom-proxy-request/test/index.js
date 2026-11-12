import { vi } from 'vitest';
const PROXY_ORIGIN = 'https://public-api.wordpress.com';

const getProxyWindow = () => document.querySelector( 'iframe' ).contentWindow;

const sendFromProxy = ( data, { origin = PROXY_ORIGIN, source = getProxyWindow() } = {} ) =>
	window.dispatchEvent( new MessageEvent( 'message', { data, origin, source } ) );

describe( 'wpcom-proxy-request', () => {
	let proxy;
	let postMessage;

	const sentRequests = () => postMessage.mock.calls.map( ( [ params ] ) => params );
	const lastRequest = () => sentRequests().at( -1 );
	const respond = ( body, statusCode, headers = {}, sent = lastRequest() ) =>
		sendFromProxy( [ body, statusCode, headers, sent.callback ] );

	const installProxy = () => {
		proxy.reloadProxy();
		postMessage = vi.spyOn( getProxyWindow(), 'postMessage' ).mockImplementation( () => {} );
	};

	beforeEach( () => {
		// The module keeps its iframe, buffered requests and cookie flag in module state,
		// so each test loads a fresh copy.
		vi.isolateModules( () => {
			proxy = require( '../src' );
		} );

		let uuid = 0;
		vi.spyOn( crypto, 'randomUUID' ).mockImplementation( () => `uuid-${ ++uuid }` );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
		document.body.innerHTML = '';
	} );

	test( 'injects a hidden proxy iframe for the current origin on the first request', () => {
		expect( document.querySelector( 'iframe' ) ).toBeNull();

		proxy.default( { path: '/me' }, () => {} );

		const iframes = document.querySelectorAll( 'iframe' );
		expect( iframes ).toHaveLength( 1 );
		expect( iframes[ 0 ].src ).toBe(
			`${ PROXY_ORIGIN }/wp-admin/rest-proxy/?v=2.0#${ window.location.origin }`
		);
		expect( iframes[ 0 ].style.display ).toBe( 'none' );
	} );

	test( 'buffers requests until the proxy is ready, then sends them to the proxy origin', () => {
		installProxy();
		proxy.default( { path: '/me' }, () => {} );
		proxy.default( { path: '/sites/example.com', method: 'post' }, () => {} );

		expect( postMessage ).not.toHaveBeenCalled();

		sendFromProxy( 'ready' );

		expect( postMessage ).toHaveBeenCalledTimes( 2 );
		expect( postMessage ).toHaveBeenCalledWith(
			expect.objectContaining( {
				path: '/me',
				method: 'GET',
				callback: 'uuid-1',
				supports_args: true,
				supports_error_obj: true,
				supports_progress: true,
			} ),
			PROXY_ORIGIN
		);
		expect( sentRequests()[ 1 ] ).toMatchObject( {
			path: '/sites/example.com',
			method: 'POST',
			callback: 'uuid-2',
		} );
	} );

	test( 'sends requests straight away once the proxy is ready', () => {
		installProxy();
		sendFromProxy( 'ready' );
		proxy.default( { path: '/me' }, () => {} );

		expect( lastRequest() ).toMatchObject( { path: '/me' } );
	} );

	test( 'passes the body and headers of a successful response to the callback', () => {
		const callback = vi.fn();
		installProxy();
		sendFromProxy( 'ready' );
		proxy.default( { path: '/me' }, callback );

		respond( { ID: 1, username: 'user' }, 200, { 'Content-Type': 'application/json' } );

		expect( callback ).toHaveBeenCalledTimes( 1 );
		expect( callback ).toHaveBeenCalledWith(
			null,
			{ ID: 1, username: 'user' },
			{ 'Content-Type': 'application/json', status: 200 }
		);
	} );

	test( 'passes each response to the callback of the request it answers', () => {
		const callbacks = [ vi.fn(), vi.fn(), vi.fn() ];
		installProxy();
		sendFromProxy( 'ready' );
		callbacks.forEach( ( callback, i ) => proxy.default( { path: `/${ i }` }, callback ) );
		const requests = sentRequests();

		[ 1, 2, 0 ].forEach( ( i ) => respond( { index: i }, 200, {}, requests[ i ] ) );

		callbacks.forEach( ( callback, i ) => {
			expect( callback ).toHaveBeenCalledTimes( 1 );
			expect( callback ).toHaveBeenCalledWith( null, { index: i }, { status: 200 } );
		} );
	} );

	test( 'resolves the returned promise when no callback is given', async () => {
		installProxy();
		sendFromProxy( 'ready' );
		const response = proxy.default( { path: '/timezones', apiNamespace: 'wpcom/v2' } );

		respond( { found: 1, timezones: [] }, 200 );

		await expect( response ).resolves.toEqual( { found: 1, timezones: [] } );
	} );

	test( 'passes a WordPress.com error for an unsuccessful response to the callback', () => {
		const callback = vi.fn();
		installProxy();
		sendFromProxy( 'ready' );
		proxy.default( { path: '/sites/this-site-does-not-exist' }, callback );

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
		installProxy();
		sendFromProxy( 'ready' );
		const response = proxy.default( { path: '/sites/example.com/posts/0' } );

		respond( { error: 'unknown_post', message: 'Unknown post' }, 404 );

		await expect( response ).rejects.toMatchObject( {
			name: 'UnknownPostError',
			statusCode: 404,
		} );
	} );

	test( 'ignores messages that are not from the proxy iframe', () => {
		const callback = vi.fn();
		installProxy();
		sendFromProxy( 'ready' );
		proxy.default( { path: '/me' }, callback );
		const message = [ { ID: 1 }, 200, {}, lastRequest().callback ];

		sendFromProxy( message, { origin: 'https://example.com' } );
		sendFromProxy( message, { source: window } );

		expect( callback ).not.toHaveBeenCalled();

		sendFromProxy( message );

		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'resolves a meta API request when the proxy confirms the update', async () => {
		installProxy();
		sendFromProxy( 'ready' );
		const response = proxy.requestAllBlogsAccess();

		expect( lastRequest() ).toMatchObject( { metaAPI: { accessAllUsersBlogs: true } } );
		respond( 'metaAPIupdated', undefined );

		await expect( response ).resolves.toBe( 'metaAPIupdated' );
	} );

	test( 'reports when the proxy says the cookie auth is missing', () => {
		installProxy();
		expect( proxy.isCookieAuthMissing() ).toBe( false );

		sendFromProxy( 'cookie-auth-missing' );

		expect( proxy.isCookieAuthMissing() ).toBe( true );
	} );
} );
