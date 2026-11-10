/**
 * @jest-environment jsdom
 */

import config from '@automattic/calypso-config';
import wpcom from 'calypso/lib/wp';
import { fetchSiteEndpoint, getBuildWowApiOverride } from '../poller';

jest.mock( '@automattic/calypso-config', () => jest.fn() );
jest.mock( 'calypso/lib/wp', () => ( { req: { get: jest.fn() } } ) );

const configMock = config as unknown as jest.Mock;
const wpcomGetMock = wpcom.req.get as jest.Mock;
const originalFetch = global.fetch;

const API = 'http://127.0.0.1:4001/api/calypso';
const search = ( api: string ) => `?build_wow=1&build_wow_api=${ encodeURIComponent( api ) }`;

beforeEach( () => {
	configMock.mockImplementation( ( key: string ) =>
		key === 'env_id' ? 'development' : undefined
	);
	wpcomGetMock.mockReset();
} );

afterEach( () => {
	global.fetch = originalFetch;
} );

describe( 'getBuildWowApiOverride', () => {
	test( 'reads a loopback http origin from the URL', () => {
		expect( getBuildWowApiOverride( search( API ) ) ).toBe( API );
		expect( getBuildWowApiOverride( search( 'http://localhost:4001/api/calypso/' ) ) ).toBe(
			'http://localhost:4001/api/calypso'
		);
		expect( getBuildWowApiOverride( search( 'http://cockpit.localhost:4001/api' ) ) ).toBe(
			'http://cockpit.localhost:4001/api'
		);
	} );

	test( 'keeps only the origin and path, dropping a query or fragment', () => {
		expect( getBuildWowApiOverride( search( `${ API }?x=1` ) ) ).toBe( API );
		expect( getBuildWowApiOverride( search( `${ API }#frag` ) ) ).toBe( API );
		expect( getBuildWowApiOverride( search( 'http://127.0.0.1:4001' ) ) ).toBe(
			'http://127.0.0.1:4001'
		);
	} );

	test.each( [
		[ 'a remote https host', 'https://example.com/api' ],
		[ 'a remote http host', 'http://example.com/api' ],
		[ 'a lookalike of a local host', 'http://localhost.example.com/api' ],
		[ 'a non-http scheme', 'ftp://127.0.0.1/api' ],
		[ 'credentials in the URL', 'http://user:pass@127.0.0.1:4001/api' ],
		[ 'a username in the URL', 'http://user@127.0.0.1:4001/api' ],
		[ 'a loopback name used as userinfo', 'http://127.0.0.1@example.com/api' ],
		[ 'a value that is not a URL', 'not a url' ],
	] )( 'ignores %s', ( _label, value ) => {
		expect( getBuildWowApiOverride( search( value ) ) ).toBeNull();
	} );

	test( 'is ignored outside development', () => {
		configMock.mockImplementation( ( key: string ) =>
			key === 'env_id' ? 'production' : undefined
		);

		expect( getBuildWowApiOverride( search( API ) ) ).toBeNull();
	} );

	test( 'is absent without the parameter', () => {
		expect( getBuildWowApiOverride( '?build_wow=1' ) ).toBeNull();
	} );
} );

describe( 'fetchSiteEndpoint', () => {
	const originalLocation = window.location;

	afterEach( () => {
		Object.defineProperty( window, 'location', { value: originalLocation, writable: true } );
	} );

	function setSearch( value: string ) {
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, search: value },
			writable: true,
		} );
	}

	test( 'asks the named server for the same path and sends no credentials', async () => {
		setSearch( search( API ) );
		const status = { build_status: 'generating' };
		global.fetch = jest.fn().mockResolvedValue( { ok: true, json: async () => status } );
		const signal = new AbortController().signal;

		await expect( fetchSiteEndpoint( 'amber-brook', 'build-wow/status', signal ) ).resolves.toBe(
			status
		);

		expect( global.fetch ).toHaveBeenCalledWith(
			`${ API }/sites/amber-brook/big-sky/build-wow/status`,
			{ signal, credentials: 'omit' }
		);
		expect( wpcomGetMock ).not.toHaveBeenCalled();
	} );

	test( 'rejects a non-2xx response so the poller reports a request error', async () => {
		setSearch( search( API ) );
		global.fetch = jest.fn().mockResolvedValue( { ok: false, status: 404 } );

		await expect(
			fetchSiteEndpoint( 'amber-brook', 'build-wow/status', new AbortController().signal )
		).rejects.toThrow( 'Status request failed with 404' );
	} );

	test( 'goes to WordPress.com when there is no override', async () => {
		setSearch( '?build_wow=1' );
		global.fetch = jest.fn();
		wpcomGetMock.mockResolvedValue( { build_status: 'live' } );
		const signal = new AbortController().signal;

		await fetchSiteEndpoint( 'example.wordpress.com', 'build-wow/status', signal );

		expect( wpcomGetMock ).toHaveBeenCalledWith( {
			path: '/sites/example.wordpress.com/big-sky/build-wow/status',
			apiNamespace: 'wpcom/v2',
			signal,
		} );
		expect( global.fetch ).not.toHaveBeenCalled();
	} );
} );
