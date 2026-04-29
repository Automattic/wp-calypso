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
	it( 'maps bad_request with no message to an empty-message bad_request', () => {
		expect( classifyMastodonError( wpErr( 'bad_request', 400 ) ) ).toEqual( {
			kind: 'bad_request',
			message: '',
		} );
	} );

	it( 'maps HTTP 429 without a body-level error code to rate_limited', () => {
		const raw = { statusCode: 429 } as unknown;
		expect( classifyMastodonError( raw ) ).toEqual( { kind: 'rate_limited' } );
	} );

	it( 'maps HTTP 429 using `status` instead of `statusCode`', () => {
		const raw = { status: 429 } as unknown;
		expect( classifyMastodonError( raw ) ).toEqual( { kind: 'rate_limited' } );
	} );

	it( 'falls back to unknown for an unrecognized body-level error code', () => {
		const raw = classifyMastodonError( wpErr( 'brand_new_code', 500 ) );
		expect( raw.kind ).toBe( 'unknown' );
	} );

	it( 'falls back to unknown for plain Errors', () => {
		const e = classifyMastodonError( new Error( 'boom' ) );
		expect( e.kind ).toBe( 'unknown' );
	} );

	it( 'falls back to unknown for null, undefined, strings and numbers', () => {
		expect( classifyMastodonError( null ).kind ).toBe( 'unknown' );
		expect( classifyMastodonError( undefined ).kind ).toBe( 'unknown' );
		expect( classifyMastodonError( 'boom' ).kind ).toBe( 'unknown' );
		expect( classifyMastodonError( 42 ).kind ).toBe( 'unknown' );
	} );
} );

describe( 'classifyMastodonError — timeline kinds', () => {
	it( 'maps mastodon_auth_required → auth_required', () => {
		expect( classifyMastodonError( { error: 'mastodon_auth_required' } ) ).toEqual( {
			kind: 'auth_required',
		} );
	} );

	it( 'maps mastodon_not_found → not_found', () => {
		expect( classifyMastodonError( { error: 'mastodon_not_found' } ) ).toEqual( {
			kind: 'not_found',
		} );
	} );

	it( 'maps mastodon_rate_limited without retry_after', () => {
		expect( classifyMastodonError( { error: 'mastodon_rate_limited' } ) ).toEqual( {
			kind: 'rate_limited',
		} );
	} );

	it( 'maps mastodon_rate_limited with retry_after', () => {
		expect(
			classifyMastodonError( {
				error: 'mastodon_rate_limited',
				data: { retry_after: 42 },
			} )
		).toEqual( { kind: 'rate_limited', retry_after: 42 } );
	} );

	it( 'maps mastodon_upstream_unavailable → upstream_unavailable', () => {
		expect( classifyMastodonError( { error: 'mastodon_upstream_unavailable' } ) ).toEqual( {
			kind: 'upstream_unavailable',
		} );
	} );
} );
