import proxy, { isCookieAuthMissing, reloadProxy } from '../src';

const proxyOrigin = 'https://public-api.wordpress.com';

const getIframe = () => document.querySelector( 'iframe' );

const sendFromProxy = ( data, { origin = proxyOrigin } = {} ) =>
	window.dispatchEvent(
		new MessageEvent( 'message', { data, origin, source: getIframe().contentWindow } )
	);

const spyOnProxy = () =>
	jest.spyOn( getIframe().contentWindow, 'postMessage' ).mockImplementation( () => {} );

const callProxy = ( params ) =>
	new Promise( ( resolve ) => {
		proxy( params, ( error, body, headers ) => resolve( { error, body, headers } ) );
	} );

describe( 'wpcom-proxy-request', () => {
	beforeEach( () => {
		// The shared test setup stubs `randomUUID()` with a constant, but each request needs its own ID.
		let id = 0;
		jest.spyOn( crypto, 'randomUUID' ).mockImplementation( () => `request-${ ++id }` );
		reloadProxy();
	} );

	test( 'injects a hidden proxy iframe pointing at the REST proxy', () => {
		const iframe = getIframe();

		expect( document.querySelectorAll( 'iframe' ) ).toHaveLength( 1 );
		expect( iframe.src ).toBe(
			`${ proxyOrigin }/wp-admin/rest-proxy/?v=2.0#${ window.location.origin }`
		);
		expect( iframe.style.display ).toBe( 'none' );
	} );

	test( 'buffers requests until the proxy is ready', () => {
		const postMessage = spyOnProxy();

		proxy( { path: '/me', method: 'post' }, () => {} );
		expect( postMessage ).not.toHaveBeenCalled();

		sendFromProxy( 'ready' );
		expect( postMessage ).toHaveBeenCalledWith(
			expect.objectContaining( {
				path: '/me',
				method: 'POST',
				callback: expect.any( String ),
				supports_args: true,
				supports_error_obj: true,
				supports_progress: true,
			} ),
			proxyOrigin
		);
	} );

	test( 'passes the body and headers of a successful response to the callback', async () => {
		const postMessage = spyOnProxy();
		sendFromProxy( 'ready' );

		const response = callProxy( { path: '/me' } );
		const [ { callback } ] = postMessage.mock.calls[ 0 ];
		sendFromProxy( [
			{ ID: 1, username: 'user' },
			200,
			{ 'Content-Type': 'application/json' },
			callback,
		] );

		await expect( response ).resolves.toEqual( {
			error: null,
			body: { ID: 1, username: 'user' },
			headers: { 'Content-Type': 'application/json', status: 200 },
		} );
	} );

	test( 'passes a WPError to the callback for a failed response', async () => {
		const postMessage = spyOnProxy();
		sendFromProxy( 'ready' );

		const response = callProxy( { path: '/sites/this-site-does-not-exist' } );
		const [ { callback } ] = postMessage.mock.calls[ 0 ];
		sendFromProxy( [ { error: 'unknown_blog', message: 'Unknown blog' }, 404, {}, callback ] );

		const { error, body, headers } = await response;
		expect( error ).toBeInstanceOf( Error );
		expect( error ).toMatchObject( {
			name: 'UnknownBlogError',
			message: 'Unknown blog',
			statusCode: 404,
		} );
		expect( body ).toBeNull();
		expect( headers ).toEqual( { status: 404 } );
	} );

	test( 'returns a promise when no callback is given', async () => {
		const postMessage = spyOnProxy();
		sendFromProxy( 'ready' );

		const success = proxy( { path: '/timezones', apiNamespace: 'wpcom/v2' } );
		const failure = proxy( { path: '/this-route-does-not-exist', apiNamespace: 'wpcom/v2' } );
		const [ [ { callback: successId } ], [ { callback: failureId } ] ] = postMessage.mock.calls;
		sendFromProxy( [ { found: 1 }, 200, {}, successId ] );
		sendFromProxy( [ { code: 'rest_no_route' }, 404, {}, failureId ] );

		await expect( success ).resolves.toEqual( { found: 1 } );
		await expect( failure ).rejects.toMatchObject( { name: 'NotFoundError', statusCode: 404 } );
	} );

	test( 'ignores messages from other origins', () => {
		const postMessage = spyOnProxy();
		const callback = jest.fn();

		proxy( { path: '/me' }, callback );
		sendFromProxy( 'ready', { origin: 'https://example.com' } );
		expect( postMessage ).not.toHaveBeenCalled();

		sendFromProxy( 'ready' );
		const [ [ { callback: id } ] ] = postMessage.mock.calls;
		sendFromProxy( [ {}, 200, {}, id ], { origin: 'https://example.com' } );
		expect( callback ).not.toHaveBeenCalled();
	} );

	test( 'replaces the iframe and drops buffered requests when the proxy is reloaded', () => {
		const oldIframe = getIframe();
		proxy( { path: '/me' }, () => {} );

		reloadProxy();
		const postMessage = spyOnProxy();
		sendFromProxy( 'ready' );

		expect( getIframe() ).not.toBe( oldIframe );
		expect( oldIframe.isConnected ).toBe( false );
		expect( postMessage ).not.toHaveBeenCalled();
	} );

	test( 'reports when the proxy is missing cookie authentication', () => {
		expect( isCookieAuthMissing() ).toBe( false );

		sendFromProxy( 'cookie-auth-missing' );

		expect( isCookieAuthMissing() ).toBe( true );
	} );
} );
