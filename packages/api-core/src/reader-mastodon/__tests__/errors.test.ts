import { classifyMastodonError } from '../errors';

function wpErr( code: string, statusCode: number, message = '' ): unknown {
	const e = new Error( message );
	( e as unknown as Record< string, unknown > ).error = code;
	( e as unknown as Record< string, unknown > ).statusCode = statusCode;
	( e as unknown as Record< string, unknown > ).status = statusCode;
	( e as unknown as Record< string, unknown > ).message = message;
	return e;
}

describe( 'classifyMastodonError', () => {
	it( 'maps invalid_instance', () => {
		expect( classifyMastodonError( wpErr( 'invalid_instance', 400 ) ).kind ).toBe(
			'invalid_instance'
		);
	} );
	it( 'maps rate_limited', () => {
		expect( classifyMastodonError( wpErr( 'rate_limited', 429 ) ).kind ).toBe( 'rate_limited' );
	} );
	it( 'maps auth_failed', () => {
		expect( classifyMastodonError( wpErr( 'auth_failed', 401 ) ).kind ).toBe( 'auth_failed' );
	} );
	it( 'maps connection_not_found', () => {
		expect( classifyMastodonError( wpErr( 'connection_not_found', 404 ) ).kind ).toBe(
			'connection_not_found'
		);
	} );
	it( 'maps upstream_unavailable', () => {
		expect( classifyMastodonError( wpErr( 'upstream_unavailable', 502 ) ).kind ).toBe(
			'upstream_unavailable'
		);
	} );
	it( 'maps bad_request with message', () => {
		const err = classifyMastodonError( wpErr( 'bad_request', 400, 'nope' ) );
		expect( err ).toEqual( { kind: 'bad_request', message: 'nope' } );
	} );
	it( 'falls back to unknown', () => {
		const e = classifyMastodonError( new Error( 'boom' ) );
		expect( e.kind ).toBe( 'unknown' );
	} );
} );
