import { classifyFediverseError } from '../errors';

function wpErr( code: string, statusCode: number, message = '' ): unknown {
	const e = new Error( message );
	( e as unknown as Record< string, unknown > ).error = code;
	( e as unknown as Record< string, unknown > ).statusCode = statusCode;
	( e as unknown as Record< string, unknown > ).status = statusCode;
	( e as unknown as Record< string, unknown > ).message = message;
	return e;
}

// Mirror the wpcom-proxy-request wire shape: the WP error code lands on
// `.code`, not `.error`. The classifier must recognize both.
function wpProxyErr( code: string, statusCode: number, message = '' ): unknown {
	const e = new Error( message );
	( e as unknown as Record< string, unknown > ).code = code;
	( e as unknown as Record< string, unknown > ).statusCode = statusCode;
	( e as unknown as Record< string, unknown > ).status = statusCode;
	( e as unknown as Record< string, unknown > ).message = message;
	return e;
}

describe( 'classifyFediverseError — body-level codes', () => {
	it( 'maps not_authenticated → auth_required', () => {
		expect( classifyFediverseError( wpErr( 'not_authenticated', 401 ) ) ).toEqual( {
			kind: 'auth_required',
		} );
	} );

	it( 'maps connection_not_found', () => {
		expect( classifyFediverseError( wpErr( 'connection_not_found', 404 ) ) ).toEqual( {
			kind: 'connection_not_found',
		} );
	} );
} );

describe( 'classifyFediverseError — slice 2 composer write-path codes', () => {
	it.each( [
		[ 'fediverse_text_too_long', 'text_too_long' ],
		[ 'reader_fediverse_text_too_long', 'text_too_long' ],
		[ 'fediverse_summary_too_long', 'summary_too_long' ],
		[ 'reader_fediverse_summary_too_long', 'summary_too_long' ],
		[ 'fediverse_visibility_invalid', 'visibility_invalid' ],
		[ 'reader_fediverse_visibility_invalid', 'visibility_invalid' ],
		[ 'fediverse_publish_disabled', 'publish_disabled' ],
		[ 'reader_fediverse_publish_disabled', 'publish_disabled' ],
		[ 'fediverse_target_unavailable', 'target_unavailable' ],
		[ 'reader_fediverse_target_unavailable', 'target_unavailable' ],
	] )( 'maps body-level %s to kind %s', ( code, kind ) => {
		expect( classifyFediverseError( wpErr( code, 400 ) ).kind ).toBe( kind );
	} );

	it.each( [
		[ 'fediverse_text_too_long', 'text_too_long' ],
		[ 'reader_fediverse_text_too_long', 'text_too_long' ],
		[ 'fediverse_publish_disabled', 'publish_disabled' ],
		[ 'reader_fediverse_publish_disabled', 'publish_disabled' ],
	] )( 'maps %s when surfaced on .code (proxy wire shape) to kind %s', ( code, kind ) => {
		expect( classifyFediverseError( wpProxyErr( code, 400 ) ).kind ).toBe( kind );
	} );

	it( 'preserves the message on bad_request', () => {
		expect(
			classifyFediverseError( wpErr( 'fediverse_bad_request', 400, 'invalid input' ) )
		).toEqual( { kind: 'bad_request', message: 'invalid input' } );
	} );

	it( 'falls back to publish_disabled for a 403 with no body-level code', () => {
		expect( classifyFediverseError( { statusCode: 403 } ).kind ).toBe( 'publish_disabled' );
	} );
} );

describe( 'classifyFediverseError — status fallbacks', () => {
	it( 'maps HTTP 401 to auth_required when no body code is present', () => {
		expect( classifyFediverseError( { statusCode: 401 } ) ).toEqual( { kind: 'auth_required' } );
	} );

	it( 'maps HTTP 404 to not_found when no body code is present', () => {
		expect( classifyFediverseError( { statusCode: 404 } ) ).toEqual( { kind: 'not_found' } );
	} );

	it( 'maps HTTP 429 to rate_limited without retry_after when none is supplied', () => {
		expect( classifyFediverseError( { statusCode: 429 } ) ).toEqual( { kind: 'rate_limited' } );
	} );

	it( 'maps HTTP 429 with retry_after on `data`', () => {
		expect( classifyFediverseError( { statusCode: 429, data: { retry_after: 42 } } ) ).toEqual( {
			kind: 'rate_limited',
			retry_after: 42,
		} );
	} );

	it( 'maps HTTP 502/503/504 to upstream_unavailable', () => {
		expect( classifyFediverseError( { statusCode: 502 } ).kind ).toBe( 'upstream_unavailable' );
		expect( classifyFediverseError( { statusCode: 503 } ).kind ).toBe( 'upstream_unavailable' );
		expect( classifyFediverseError( { statusCode: 504 } ).kind ).toBe( 'upstream_unavailable' );
	} );

	it( 'maps HTTP 429 surfaced via `status` instead of `statusCode`', () => {
		expect( classifyFediverseError( { status: 429 } ) ).toEqual( { kind: 'rate_limited' } );
	} );
} );

describe( 'classifyFediverseError — proxy wire shape', () => {
	it( 'classifies not_authenticated surfaced on .code', () => {
		expect( classifyFediverseError( wpProxyErr( 'not_authenticated', 401 ) ) ).toEqual( {
			kind: 'auth_required',
		} );
	} );

	it( 'classifies connection_not_found surfaced on .code', () => {
		expect( classifyFediverseError( wpProxyErr( 'connection_not_found', 404 ) ) ).toEqual( {
			kind: 'connection_not_found',
		} );
	} );
} );

describe( 'classifyFediverseError — fallback', () => {
	it( 'falls back to unknown for an unrecognised body-level code on a 500', () => {
		expect( classifyFediverseError( wpErr( 'brand_new_code', 500 ) ).kind ).toBe( 'unknown' );
	} );

	it( 'falls back to unknown for plain Errors', () => {
		expect( classifyFediverseError( new Error( 'boom' ) ).kind ).toBe( 'unknown' );
	} );

	it( 'falls back to unknown for null, undefined, strings and numbers', () => {
		expect( classifyFediverseError( null ).kind ).toBe( 'unknown' );
		expect( classifyFediverseError( undefined ).kind ).toBe( 'unknown' );
		expect( classifyFediverseError( 'boom' ).kind ).toBe( 'unknown' );
		expect( classifyFediverseError( 42 ).kind ).toBe( 'unknown' );
	} );
} );
