import { classifyAtmosphereError } from '../errors';

function wpErr( code: string, statusCode: number, message = '' ): unknown {
	const e = new Error( message );
	( e as unknown as Record< string, unknown > ).error = code;
	( e as unknown as Record< string, unknown > ).statusCode = statusCode;
	( e as unknown as Record< string, unknown > ).status = statusCode;
	( e as unknown as Record< string, unknown > ).message = message;
	return e;
}

describe( 'classifyAtmosphereError', () => {
	it( 'maps invalid_handle', () => {
		expect( classifyAtmosphereError( wpErr( 'invalid_handle', 400 ) ).kind ).toBe(
			'invalid_handle'
		);
	} );
	it( 'maps invalid_credentials', () => {
		expect( classifyAtmosphereError( wpErr( 'invalid_credentials', 401 ) ).kind ).toBe(
			'invalid_credentials'
		);
	} );
	it( 'maps rate_limited', () => {
		expect( classifyAtmosphereError( wpErr( 'rate_limited', 429 ) ).kind ).toBe( 'rate_limited' );
	} );
	it( 'maps auth_failed', () => {
		expect( classifyAtmosphereError( wpErr( 'auth_failed', 401 ) ).kind ).toBe( 'auth_failed' );
	} );
	it( 'maps connection_not_found', () => {
		expect( classifyAtmosphereError( wpErr( 'connection_not_found', 404 ) ).kind ).toBe(
			'connection_not_found'
		);
	} );
	it( 'maps upstream_unavailable', () => {
		expect( classifyAtmosphereError( wpErr( 'upstream_unavailable', 502 ) ).kind ).toBe(
			'upstream_unavailable'
		);
	} );
	it( 'falls back to unknown', () => {
		const e = classifyAtmosphereError( new Error( 'boom' ) );
		expect( e.kind ).toBe( 'unknown' );
	} );
} );
