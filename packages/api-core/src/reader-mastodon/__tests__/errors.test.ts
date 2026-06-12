import { classifyMastodonError } from '../errors';

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
// classifier must recognize both to avoid silently falling through to
// `{ kind: 'unknown' }` for live upstream failures on non-401/429 paths
// (401 and 429 are accidentally caught by the statusCode fallback).
function wpProxyErr( code: string, statusCode: number, message = '' ): unknown {
	const e = new Error( message );
	( e as unknown as Record< string, unknown > ).code = code;
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

describe( 'classifyMastodonError — wpcom-proxy wire shape', () => {
	it( 'classifies mastodon_not_found surfaced on .code', () => {
		expect( classifyMastodonError( wpProxyErr( 'mastodon_not_found', 404 ) ) ).toEqual( {
			kind: 'not_found',
		} );
	} );

	it( 'classifies reader_mastodon_not_found surfaced on .code', () => {
		expect( classifyMastodonError( wpProxyErr( 'reader_mastodon_not_found', 404 ) ) ).toEqual( {
			kind: 'not_found',
		} );
	} );

	it( 'classifies mastodon_upstream_unavailable surfaced on .code', () => {
		expect( classifyMastodonError( wpProxyErr( 'mastodon_upstream_unavailable', 502 ) ) ).toEqual( {
			kind: 'upstream_unavailable',
		} );
	} );

	it( 'classifies reader_mastodon_bad_request surfaced on .code, preserving the message', () => {
		expect(
			classifyMastodonError( wpProxyErr( 'reader_mastodon_bad_request', 400, 'nope' ) )
		).toEqual( { kind: 'bad_request', message: 'nope' } );
	} );

	it( 'classifies invalid_instance surfaced on .code', () => {
		expect( classifyMastodonError( wpProxyErr( 'invalid_instance', 400 ) ) ).toEqual( {
			kind: 'invalid_instance',
		} );
	} );

	it( 'preserves retry_after when mastodon_rate_limited arrives on .code', () => {
		const e = new Error( '' );
		( e as unknown as Record< string, unknown > ).code = 'mastodon_rate_limited';
		( e as unknown as Record< string, unknown > ).statusCode = 429;
		( e as unknown as Record< string, unknown > ).status = 429;
		( e as unknown as Record< string, unknown > ).data = { retry_after: 42 };
		expect( classifyMastodonError( e ) ).toEqual( {
			kind: 'rate_limited',
			retry_after: 42,
		} );
	} );
} );

describe( 'classifyMastodonError — slice 8a media kinds', () => {
	it.each( [
		[ 'mastodon_media_too_large', 'media_too_large' ],
		[ 'mastodon_media_unsupported_type', 'media_unsupported_type' ],
		[ 'mastodon_media_decode_failed', 'media_decode_failed' ],
		[ 'mastodon_media_invalid', 'media_invalid' ],
	] )( 'maps wpcom error code %s to kind %s', ( code, kind ) => {
		expect( classifyMastodonError( wpErr( code, 400, 'm' ) ) ).toMatchObject( { kind } );
	} );

	it.each( [
		[ 'mastodon_media_too_large', 'media_too_large' ],
		[ 'mastodon_media_unsupported_type', 'media_unsupported_type' ],
		[ 'mastodon_media_decode_failed', 'media_decode_failed' ],
		[ 'mastodon_media_invalid', 'media_invalid' ],
	] )(
		'maps wpcom error code %s to kind %s when surfaced on .code (proxy wire shape)',
		( code, kind ) => {
			expect( classifyMastodonError( wpProxyErr( code, 400, 'm' ) ) ).toMatchObject( { kind } );
		}
	);

	it( 'preserves the message on media_too_large', () => {
		expect( classifyMastodonError( wpErr( 'mastodon_media_too_large', 400, 'too big' ) ) ).toEqual(
			{ kind: 'media_too_large', message: 'too big' }
		);
	} );
} );
