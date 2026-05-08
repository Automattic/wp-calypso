import { classifyAtmosphereError } from '../errors';

function wpErr( code: string, statusCode: number, message = '' ): unknown {
	const e = new Error( message );
	( e as unknown as Record< string, unknown > ).error = code;
	( e as unknown as Record< string, unknown > ).statusCode = statusCode;
	( e as unknown as Record< string, unknown > ).status = statusCode;
	( e as unknown as Record< string, unknown > ).message = message;
	return e;
}

// Mirror the actual shape that wpcom-proxy-request raises for a WP REST
// envelope error: the WP error code lands on `.code`, not `.error`. The
// classifier must recognise both to avoid silently falling through to
// `{ kind: 'unknown' }` for live upstream failures.
function wpProxyErr( code: string, statusCode: number, message = '' ): unknown {
	const e = new Error( message );
	( e as unknown as Record< string, unknown > ).code = code;
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

	it( 'classifies wpcom-proxy errors that surface the code on .code', () => {
		expect(
			classifyAtmosphereError( wpProxyErr( 'atmosphere_upstream_unavailable', 403 ) ).kind
		).toBe( 'upstream_unavailable' );
		expect( classifyAtmosphereError( wpProxyErr( 'atmosphere_rate_limited', 429 ) ).kind ).toBe(
			'rate_limited'
		);
		expect( classifyAtmosphereError( wpProxyErr( 'connection_not_found', 404 ) ).kind ).toBe(
			'connection_not_found'
		);
	} );

	// Slice 7c POST /reader/atmosphere/connections/{id}/posts ships nine
	// wire-stable error codes; pin the four newcomers so they don't
	// silently regress to `{ kind: 'unknown' }` (which renders the generic
	// "Something went wrong" banner).
	it( 'maps atmosphere_text_too_long', () => {
		expect( classifyAtmosphereError( wpErr( 'atmosphere_text_too_long', 400 ) ).kind ).toBe(
			'text_too_long'
		);
	} );
	it( 'maps atmosphere_reply_disabled', () => {
		expect( classifyAtmosphereError( wpErr( 'atmosphere_reply_disabled', 403 ) ).kind ).toBe(
			'reply_disabled'
		);
	} );
	it( 'maps atmosphere_quote_disabled', () => {
		expect( classifyAtmosphereError( wpErr( 'atmosphere_quote_disabled', 403 ) ).kind ).toBe(
			'quote_disabled'
		);
	} );
	it( 'maps atmosphere_target_unavailable', () => {
		expect( classifyAtmosphereError( wpErr( 'atmosphere_target_unavailable', 404 ) ).kind ).toBe(
			'target_unavailable'
		);
	} );
} );

describe( 'classifyAtmosphereError — slice 8a media surface', () => {
	// The slice-8a backend deliberately collapses every blob/media-related
	// rejection into the generic `atmosphere_bad_request` wire code (see
	// `reader-atmosphere/AGENTS.md` — "the wire stays stable"). Pin that
	// expectation so a future refactor doesn't silently expect specific
	// blob/media subtypes that never arrive.
	it.each( [
		'POST /blobs — image too large',
		'POST /blobs — unsupported image type',
		'POST /blobs — undecodable image',
		'POST /posts — invalid media body',
	] )( 'classifies %s as bad_request', () => {
		const raw = { code: 'atmosphere_bad_request', message: 'rejected', status: 400 };
		const err = classifyAtmosphereError( raw );
		expect( err.kind ).toBe( 'bad_request' );
	} );
} );
