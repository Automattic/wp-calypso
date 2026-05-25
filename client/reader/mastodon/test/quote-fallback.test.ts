import { createMastodonPostMutation } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import nock from 'nock';

const BASE = 'https://public-api.wordpress.com';

function makeQueryClient() {
	return new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
}

describe( 'createMastodonPostMutation — quote fallback', () => {
	afterEach( () => nock.cleanAll() );

	it( 'submits quoted_status_id natively on the first attempt and resolves', async () => {
		const scope = nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/statuses', {
				status: 'commentary',
				quoted_status_id: '116522382646486388',
			} )
			.reply( 200, {
				id: '999',
				url: 'https://mastodon.social/@me/999',
				in_reply_to_id: null,
			} );

		const mutation = createMastodonPostMutation( makeQueryClient() );
		const result = await mutation.mutationFn?.( {
			connectionId: 7,
			status: 'commentary',
			quoted_status_id: '116522382646486388',
			quotedFallbackPermalink: 'https://mastodon.social/@alice/116522382646486388',
		} );

		expect( result?.id ).toBe( '999' );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'falls back to text-based quoting when the native attempt returns bad_request', async () => {
		const native = nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/statuses', {
				status: 'commentary',
				quoted_status_id: '116522382646486388',
			} )
			.reply( 400, {
				error: 'reader_mastodon_bad_request',
				message: 'quoting unsupported',
			} );
		// Retry: quoted_status_id removed, permalink appended to status with
		// a blank-line separator. The wire body must NOT carry the
		// client-only quotedFallbackPermalink hint.
		const fallback = nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/statuses', ( body ) => {
				return (
					body.status === 'commentary\n\nhttps://mastodon.social/@alice/116522382646486388' &&
					! ( 'quoted_status_id' in body ) &&
					! ( 'quotedFallbackPermalink' in body )
				);
			} )
			.reply( 200, {
				id: '999',
				url: 'https://mastodon.social/@me/999',
				in_reply_to_id: null,
			} );

		const mutation = createMastodonPostMutation( makeQueryClient() );
		const result = await mutation.mutationFn?.( {
			connectionId: 7,
			status: 'commentary',
			quoted_status_id: '116522382646486388',
			quotedFallbackPermalink: 'https://mastodon.social/@alice/116522382646486388',
		} );

		expect( result?.id ).toBe( '999' );
		expect( native.isDone() ).toBe( true );
		expect( fallback.isDone() ).toBe( true );
	} );

	it( 'falls back to bare permalink when the user submitted empty commentary', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/statuses', {
				status: '',
				quoted_status_id: '116522382646486388',
			} )
			.reply( 400, { error: 'reader_mastodon_bad_request' } );
		const fallback = nock( BASE )
			.post(
				'/wpcom/v2/reader/mastodon/connections/7/statuses',
				( body ) => body.status === 'https://mastodon.social/@alice/116522382646486388'
			)
			.reply( 200, {
				id: '999',
				url: 'https://mastodon.social/@me/999',
				in_reply_to_id: null,
			} );

		const mutation = createMastodonPostMutation( makeQueryClient() );
		await mutation.mutationFn?.( {
			connectionId: 7,
			status: '',
			quoted_status_id: '116522382646486388',
			quotedFallbackPermalink: 'https://mastodon.social/@alice/116522382646486388',
		} );

		expect( fallback.isDone() ).toBe( true );
	} );

	it( 'does not retry when the bad_request comes from a non-quote attempt', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/statuses', { status: 'plain' } )
			.reply( 400, { error: 'reader_mastodon_bad_request' } );

		const mutation = createMastodonPostMutation( makeQueryClient() );
		await expect(
			mutation.mutationFn?.( { connectionId: 7, status: 'plain' } )
		).rejects.toMatchObject( { kind: 'bad_request' } );
	} );

	it( 'does not retry when the quote attempt has no quotedFallbackPermalink', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/statuses', {
				status: 'commentary',
				quoted_status_id: '116522382646486388',
			} )
			.reply( 400, { error: 'reader_mastodon_bad_request' } );

		const mutation = createMastodonPostMutation( makeQueryClient() );
		await expect(
			mutation.mutationFn?.( {
				connectionId: 7,
				status: 'commentary',
				quoted_status_id: '116522382646486388',
			} )
		).rejects.toMatchObject( { kind: 'bad_request' } );
	} );

	it( 'preserves in_reply_to_id on the retry path when a quote-reply combo falls back', async () => {
		// The composer config doesn't combine reply + quote today, but the
		// type allows it and `...rest` must propagate `in_reply_to_id`. If
		// this test ever fails, the wrapper has dropped a wire field on the
		// fallback path.
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/statuses', {
				status: 'commentary',
				quoted_status_id: '116522382646486388',
				in_reply_to_id: '108020',
			} )
			.reply( 400, { error: 'reader_mastodon_bad_request' } );
		const fallback = nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/statuses', ( body ) => {
				return (
					body.status === 'commentary\n\nhttps://mastodon.social/@alice/116522382646486388' &&
					body.in_reply_to_id === '108020' &&
					! ( 'quoted_status_id' in body )
				);
			} )
			.reply( 200, {
				id: '999',
				url: 'https://mastodon.social/@me/999',
				in_reply_to_id: '108020',
			} );

		const mutation = createMastodonPostMutation( makeQueryClient() );
		await mutation.mutationFn?.( {
			connectionId: 7,
			status: 'commentary',
			in_reply_to_id: '108020',
			quoted_status_id: '116522382646486388',
			quotedFallbackPermalink: 'https://mastodon.social/@alice/116522382646486388',
		} );

		expect( fallback.isDone() ).toBe( true );
	} );

	it( 'propagates non-bad_request errors without falling back', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/statuses' )
			.reply( 401, { error: 'not_authenticated' } );

		const mutation = createMastodonPostMutation( makeQueryClient() );
		await expect(
			mutation.mutationFn?.( {
				connectionId: 7,
				status: 'commentary',
				quoted_status_id: '116522382646486388',
				quotedFallbackPermalink: 'https://mastodon.social/@alice/116522382646486388',
			} )
		).rejects.toMatchObject( { kind: 'auth_required' } );
	} );

	it( 'invokes onQuoteFallback exactly once when the fallback path fires', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/statuses', {
				status: 'commentary',
				quoted_status_id: '116522382646486388',
			} )
			.reply( 400, { error: 'reader_mastodon_bad_request' } );
		nock( BASE )
			.post(
				'/wpcom/v2/reader/mastodon/connections/7/statuses',
				( body ) =>
					body.status === 'commentary\n\nhttps://mastodon.social/@alice/116522382646486388'
			)
			.reply( 200, {
				id: '999',
				url: 'https://mastodon.social/@me/999',
				in_reply_to_id: null,
			} );

		const onQuoteFallback = jest.fn();
		const mutation = createMastodonPostMutation( makeQueryClient(), { onQuoteFallback } );
		await mutation.mutationFn?.( {
			connectionId: 7,
			status: 'commentary',
			quoted_status_id: '116522382646486388',
			quotedFallbackPermalink: 'https://mastodon.social/@alice/116522382646486388',
		} );

		expect( onQuoteFallback ).toHaveBeenCalledTimes( 1 );
		expect( onQuoteFallback ).toHaveBeenCalledWith(
			expect.objectContaining( { connectionId: 7, quoted_status_id: '116522382646486388' } )
		);
	} );

	it( 'does not invoke onQuoteFallback on a successful native attempt', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/statuses', {
				status: 'commentary',
				quoted_status_id: '116522382646486388',
			} )
			.reply( 200, {
				id: '999',
				url: 'https://mastodon.social/@me/999',
				in_reply_to_id: null,
			} );

		const onQuoteFallback = jest.fn();
		const mutation = createMastodonPostMutation( makeQueryClient(), { onQuoteFallback } );
		await mutation.mutationFn?.( {
			connectionId: 7,
			status: 'commentary',
			quoted_status_id: '116522382646486388',
			quotedFallbackPermalink: 'https://mastodon.social/@alice/116522382646486388',
		} );

		expect( onQuoteFallback ).not.toHaveBeenCalled();
	} );

	it( 'does not invoke onQuoteFallback when bad_request comes from a non-quote attempt', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/statuses', { status: 'plain' } )
			.reply( 400, { error: 'reader_mastodon_bad_request' } );

		const onQuoteFallback = jest.fn();
		const mutation = createMastodonPostMutation( makeQueryClient(), { onQuoteFallback } );
		await expect(
			mutation.mutationFn?.( { connectionId: 7, status: 'plain' } )
		).rejects.toMatchObject( { kind: 'bad_request' } );

		expect( onQuoteFallback ).not.toHaveBeenCalled();
	} );

	it( 'surfaces the second-attempt error when the text-fallback retry also fails', async () => {
		// Native quote attempt 400s as bad_request → fallback fires.
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/statuses', {
				status: 'commentary',
				quoted_status_id: '116522382646486388',
			} )
			.reply( 400, { error: 'reader_mastodon_bad_request' } );
		// Retry comes back with a *different* error (auth expired mid-flight).
		// The wrapper must surface the retry's error, not the original
		// bad_request — the user sees the current state.
		nock( BASE )
			.post(
				'/wpcom/v2/reader/mastodon/connections/7/statuses',
				( body ) =>
					body.status === 'commentary\n\nhttps://mastodon.social/@alice/116522382646486388'
			)
			.reply( 401, { error: 'not_authenticated' } );

		const mutation = createMastodonPostMutation( makeQueryClient() );
		await expect(
			mutation.mutationFn?.( {
				connectionId: 7,
				status: 'commentary',
				quoted_status_id: '116522382646486388',
				quotedFallbackPermalink: 'https://mastodon.social/@alice/116522382646486388',
			} )
		).rejects.toMatchObject( { kind: 'auth_required' } );
	} );

	it( 'invokes onQuoteFallbackFailed exactly once when the retry fails', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/statuses', {
				status: 'commentary',
				quoted_status_id: '116522382646486388',
			} )
			.reply( 400, { error: 'reader_mastodon_bad_request' } );
		nock( BASE )
			.post(
				'/wpcom/v2/reader/mastodon/connections/7/statuses',
				( body ) =>
					body.status === 'commentary\n\nhttps://mastodon.social/@alice/116522382646486388'
			)
			.reply( 400, { error: 'reader_mastodon_bad_request' } );

		const onQuoteFallback = jest.fn();
		const onQuoteFallbackFailed = jest.fn();
		const mutation = createMastodonPostMutation( makeQueryClient(), {
			onQuoteFallback,
			onQuoteFallbackFailed,
		} );
		await expect(
			mutation.mutationFn?.( {
				connectionId: 7,
				status: 'commentary',
				quoted_status_id: '116522382646486388',
				quotedFallbackPermalink: 'https://mastodon.social/@alice/116522382646486388',
			} )
		).rejects.toMatchObject( { kind: 'bad_request' } );

		expect( onQuoteFallback ).toHaveBeenCalledTimes( 1 );
		expect( onQuoteFallbackFailed ).toHaveBeenCalledTimes( 1 );
		expect( onQuoteFallbackFailed ).toHaveBeenCalledWith(
			expect.objectContaining( { connectionId: 7 } ),
			expect.objectContaining( { kind: 'bad_request' } ),
			expect.objectContaining( { kind: 'bad_request' } )
		);
	} );

	it( 'does not invoke onQuoteFallbackFailed when the retry succeeds', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/statuses', {
				status: 'commentary',
				quoted_status_id: '116522382646486388',
			} )
			.reply( 400, { error: 'reader_mastodon_bad_request' } );
		nock( BASE )
			.post(
				'/wpcom/v2/reader/mastodon/connections/7/statuses',
				( body ) =>
					body.status === 'commentary\n\nhttps://mastodon.social/@alice/116522382646486388'
			)
			.reply( 200, {
				id: '999',
				url: 'https://mastodon.social/@me/999',
				in_reply_to_id: null,
			} );

		const onQuoteFallbackFailed = jest.fn();
		const mutation = createMastodonPostMutation( makeQueryClient(), { onQuoteFallbackFailed } );
		await mutation.mutationFn?.( {
			connectionId: 7,
			status: 'commentary',
			quoted_status_id: '116522382646486388',
			quotedFallbackPermalink: 'https://mastodon.social/@alice/116522382646486388',
		} );

		expect( onQuoteFallbackFailed ).not.toHaveBeenCalled();
	} );

	it( 'falls back to bare permalink when status is whitespace-only', async () => {
		// `body.trimEnd()` empties whitespace-only input, so the fallback
		// emits the bare permalink (no leading blank line). Pin this in
		// case anyone changes the truthy check to `body.length > 0`.
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/statuses', {
				status: '   ',
				quoted_status_id: '116522382646486388',
			} )
			.reply( 400, { error: 'reader_mastodon_bad_request' } );
		const fallback = nock( BASE )
			.post(
				'/wpcom/v2/reader/mastodon/connections/7/statuses',
				( body ) =>
					body.status === 'https://mastodon.social/@alice/116522382646486388' &&
					! ( 'quoted_status_id' in body )
			)
			.reply( 200, {
				id: '999',
				url: 'https://mastodon.social/@me/999',
				in_reply_to_id: null,
			} );

		const mutation = createMastodonPostMutation( makeQueryClient() );
		await mutation.mutationFn?.( {
			connectionId: 7,
			status: '   ',
			quoted_status_id: '116522382646486388',
			quotedFallbackPermalink: 'https://mastodon.social/@alice/116522382646486388',
		} );

		expect( fallback.isDone() ).toBe( true );
	} );

	it( 'does not retry when quotedFallbackPermalink is explicitly undefined', async () => {
		// `buildParams` for the quote arm emits
		// `quotedFallbackPermalink: undefined` when the preview lacks a
		// permalink. The wrapper must treat that the same as "field
		// absent" and propagate the original bad_request unchanged.
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/statuses', {
				status: 'commentary',
				quoted_status_id: '116522382646486388',
			} )
			.reply( 400, { error: 'reader_mastodon_bad_request' } );

		const mutation = createMastodonPostMutation( makeQueryClient() );
		await expect(
			mutation.mutationFn?.( {
				connectionId: 7,
				status: 'commentary',
				quoted_status_id: '116522382646486388',
				quotedFallbackPermalink: undefined,
			} )
		).rejects.toMatchObject( { kind: 'bad_request' } );
	} );

	it( 'still completes the retry when onQuoteFallback throws', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/statuses', {
				status: 'commentary',
				quoted_status_id: '116522382646486388',
			} )
			.reply( 400, { error: 'reader_mastodon_bad_request' } );
		const fallback = nock( BASE )
			.post(
				'/wpcom/v2/reader/mastodon/connections/7/statuses',
				( body ) =>
					body.status === 'commentary\n\nhttps://mastodon.social/@alice/116522382646486388'
			)
			.reply( 200, {
				id: '999',
				url: 'https://mastodon.social/@me/999',
				in_reply_to_id: null,
			} );

		const onQuoteFallback = jest.fn( () => {
			throw new Error( 'observability blew up' );
		} );
		const mutation = createMastodonPostMutation( makeQueryClient(), { onQuoteFallback } );
		const result = await mutation.mutationFn?.( {
			connectionId: 7,
			status: 'commentary',
			quoted_status_id: '116522382646486388',
			quotedFallbackPermalink: 'https://mastodon.social/@alice/116522382646486388',
		} );

		expect( onQuoteFallback ).toHaveBeenCalledTimes( 1 );
		expect( fallback.isDone() ).toBe( true );
		expect( result?.id ).toBe( '999' );
	} );
} );
