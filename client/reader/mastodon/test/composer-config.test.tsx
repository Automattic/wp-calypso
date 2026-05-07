/**
 * @jest-environment jsdom
 */
import { render, renderHook } from '@testing-library/react';
import { useTranslate } from 'i18n-calypso';
import { mastodonComposerConfig } from '../composer-config';
import type { MastodonError } from '@automattic/api-core';
import type { ActiveMode, Translate } from 'calypso/reader/social/composer';

function getTranslate(): Translate {
	const { result } = renderHook( () => useTranslate() );
	return result.current;
}

const replyMode: ActiveMode = {
	kind: 'reply',
	connectionId: 42,
	root: { uri: '108020' },
	parent: { uri: '108020' },
	previewPost: {
		uri: '108020',
		permalink: 'https://mastodon.social/@alice/108020',
		text: 'parent body',
		html: '<p>parent body</p>',
		author: { handle: 'alice', display_name: 'Alice' },
	},
};

const quotePreview = {
	uri: '109876543210',
	permalink: 'https://mastodon.social/@alice/109876543210',
	text: 'hello mastodon',
	html: '<p>hello mastodon</p>',
	author: { handle: 'alice@mastodon.social', display_name: 'Alice' },
};

const quoteMode: ActiveMode = {
	kind: 'quote',
	connectionId: 42,
	quote: { uri: '109876543210' },
	previewPost: quotePreview,
};

const standaloneMode: ActiveMode = {
	kind: 'standalone',
	connectionId: 42,
	entry_point: 'fab',
};

describe( 'mastodonComposerConfig', () => {
	describe( 'supportedModes', () => {
		it( 'supports reply, quote, and standalone', () => {
			expect( mastodonComposerConfig.supportedModes ).toEqual( [ 'reply', 'quote', 'standalone' ] );
		} );
	} );

	describe( 'limit', () => {
		it( 'is 500 (default Mastodon per-instance limit)', () => {
			expect( mastodonComposerConfig.limit ).toBe( 500 );
		} );
	} );

	describe( 'buildParams', () => {
		it( 'reply mode includes in_reply_to_id from parent.uri', () => {
			const params = mastodonComposerConfig.buildParams( replyMode, 'a reply' );
			expect( params ).toEqual( {
				connectionId: 42,
				status: 'a reply',
				in_reply_to_id: '108020',
			} );
		} );

		it( 'standalone mode omits in_reply_to_id', () => {
			const params = mastodonComposerConfig.buildParams( standaloneMode, 'a post' );
			expect( params ).toEqual( {
				connectionId: 42,
				status: 'a post',
			} );
			expect( params ).not.toHaveProperty( 'in_reply_to_id' );
		} );

		it( 'quote mode sets quoted_status_id and surfaces the permalink as a fallback hint', () => {
			// Native Mastodon 4.5+ quote: send `quoted_status_id` on the wire
			// and pass the permalink alongside as `quotedFallbackPermalink`.
			// The mutation layer uses the fallback only on bad_request from
			// older instances. Crucially, `status` is the user's text untouched
			// — no permalink append at buildParams time.
			expect( mastodonComposerConfig.buildParams( quoteMode, 'great point' ) ).toEqual( {
				connectionId: 42,
				status: 'great point',
				quoted_status_id: '109876543210',
				quotedFallbackPermalink: 'https://mastodon.social/@alice/109876543210',
			} );
		} );

		it( 'quote mode submits an empty status when the user has not typed anything', () => {
			// The user can publish a quote with no commentary; native quotes
			// carry the embedded reference via `quoted_status_id` so an empty
			// status is fine. The composer's own "empty body" UI gate is
			// upstream of this.
			expect( mastodonComposerConfig.buildParams( quoteMode, '' ) ).toEqual( {
				connectionId: 42,
				status: '',
				quoted_status_id: '109876543210',
				quotedFallbackPermalink: 'https://mastodon.social/@alice/109876543210',
			} );
		} );

		it( 'quote mode passes through user text verbatim — no trim, no permalink append', () => {
			// Trailing whitespace and the absence of the URL in `status` are
			// intentional: the wire shape of a native quote does not include
			// the permalink in the body. Trim happens only on the bad_request
			// retry path (mutation layer).
			expect( mastodonComposerConfig.buildParams( quoteMode, 'commentary   ' ) ).toEqual( {
				connectionId: 42,
				status: 'commentary   ',
				quoted_status_id: '109876543210',
				quotedFallbackPermalink: 'https://mastodon.social/@alice/109876543210',
			} );
		} );

		it( 'quote mode emits an undefined fallback permalink when previewPost lacks one', () => {
			// Belt-and-suspenders: panels always pass a SocialPost (which
			// carries a permalink) but the structural PreviewPost type allows
			// it to be missing. Surface that to the mutation as `undefined` so
			// the fallback retry knows it has nothing to fall back to and
			// re-throws the upstream bad_request rather than retrying with an
			// empty trailer.
			const mode: ActiveMode = {
				kind: 'quote',
				connectionId: 42,
				quote: { uri: '109876543210' },
				previewPost: { ...quotePreview, permalink: undefined },
			};
			expect( mastodonComposerConfig.buildParams( mode, 'commentary' ) ).toEqual( {
				connectionId: 42,
				status: 'commentary',
				quoted_status_id: '109876543210',
				quotedFallbackPermalink: undefined,
			} );
		} );
	} );

	describe( 'errorMessage', () => {
		const cases: Array< [ MastodonError[ 'kind' ], MastodonError ] > = [
			[ 'bad_request', { kind: 'bad_request', message: 'x' } ],
			[ 'auth_required', { kind: 'auth_required' } ],
			[ 'auth_failed', { kind: 'auth_failed' } ],
			[ 'rate_limited', { kind: 'rate_limited' } ],
			[ 'upstream_unavailable', { kind: 'upstream_unavailable' } ],
			[ 'connection_not_found', { kind: 'connection_not_found' } ],
			[ 'not_found', { kind: 'not_found' } ],
			[ 'invalid_instance', { kind: 'invalid_instance' } ],
			[ 'unknown', { kind: 'unknown', cause: null } ],
		];

		it.each( cases )( 'renders non-empty copy for %s', ( _kind, err ) => {
			const t = getTranslate();
			const node = mastodonComposerConfig.errorMessage( err, t );
			const { container } = render( <span>{ node }</span> );
			expect( container.textContent?.trim().length ).toBeGreaterThan( 0 );
		} );

		it( 'auth_required renders a Reconnect link to /reader/mastodon/connect', () => {
			const t = getTranslate();
			const node = mastodonComposerConfig.errorMessage( { kind: 'auth_required' }, t );
			const { container } = render( <span>{ node }</span> );
			const link = container.querySelector( 'a' );
			expect( link ).not.toBeNull();
			expect( link?.getAttribute( 'href' ) ).toBe( '/reader/mastodon/connect' );
		} );

		it.each( [
			[ 'media_too_large', 'Image is too large. Try a smaller image (under 8 MB).' ],
			[ 'media_unsupported_type', 'Image format isn’t supported. Try JPEG, PNG, GIF, or WebP.' ],
			[ 'media_decode_failed', 'We couldn’t process this image. Try a different file.' ],
			[ 'media_invalid', 'We couldn’t post this. Try a different image.' ],
		] as const )( 'returns expected copy for kind=%s', ( kind, expected ) => {
			const t = getTranslate();
			const node = mastodonComposerConfig.errorMessage( { kind } as MastodonError, t );
			const { container } = render( <span>{ node }</span> );
			expect( container.textContent ).toBe( expected );
		} );
	} );

	describe( 'useMedia', () => {
		it( 'wires useMedia to useMastodonComposerMedia', () => {
			expect( mastodonComposerConfig.useMedia ).toBeDefined();
		} );
	} );

	describe( 'successNotice', () => {
		it( 'reply links to the parent thread URL', () => {
			const t = getTranslate();
			const result = { id: '999', url: 'https://example.com', in_reply_to_id: '108020' };
			const notice = mastodonComposerConfig.successNotice( replyMode, result, t );
			expect( typeof notice.threadUrl ).toBe( 'string' );
			expect( notice.threadUrl ).toContain( '108020' );
		} );

		it( 'standalone links to the new post id', () => {
			const t = getTranslate();
			const result = { id: '999', url: 'https://example.com', in_reply_to_id: null };
			const notice = mastodonComposerConfig.successNotice( standaloneMode, result, t );
			expect( notice.threadUrl ).toContain( '999' );
		} );
	} );

	describe( 'tracks', () => {
		it( 'opened reply emits the reply event with parent_uri', () => {
			const e = mastodonComposerConfig.tracks.opened( replyMode );
			expect( e.event ).toBe( 'calypso_reader_mastodon_reply_composer_opened' );
			expect( e.props ).toMatchObject( { connection_id: 42, parent_uri: '108020' } );
		} );

		it( 'opened standalone emits the compose event with entry_point', () => {
			const e = mastodonComposerConfig.tracks.opened( standaloneMode );
			expect( e.event ).toBe( 'calypso_reader_mastodon_compose_opened' );
			expect( e.props ).toMatchObject( { connection_id: 42, entry_point: 'fab' } );
		} );

		it( 'published reply emits the reply event with new_post_id', () => {
			const result = { id: '999', url: 'x', in_reply_to_id: '108020' };
			const e = mastodonComposerConfig.tracks.published( replyMode, result );
			expect( e.event ).toBe( 'calypso_reader_mastodon_reply_published' );
			expect( e.props ).toMatchObject( {
				connection_id: 42,
				parent_uri: '108020',
				new_post_id: '999',
			} );
		} );

		it( 'errorShown standalone carries error_kind', () => {
			const e = mastodonComposerConfig.tracks.errorShown( standaloneMode, {
				kind: 'rate_limited',
			} );
			expect( e.event ).toBe( 'calypso_reader_mastodon_compose_error_shown' );
			expect( e.props ).toMatchObject( { connection_id: 42, error_kind: 'rate_limited' } );
		} );

		it( 'errorShown reply carries parent_uri + error_kind', () => {
			const e = mastodonComposerConfig.tracks.errorShown( replyMode, {
				kind: 'bad_request',
				message: 'x',
			} );
			expect( e.event ).toBe( 'calypso_reader_mastodon_reply_error_shown' );
			expect( e.props ).toMatchObject( {
				connection_id: 42,
				parent_uri: '108020',
				error_kind: 'bad_request',
			} );
		} );
	} );

	describe( 'copy', () => {
		it( 'reply title is "Reply"', () => {
			const t = getTranslate();
			expect( mastodonComposerConfig.copy.title( replyMode, t ) ).toBe( 'Reply' );
		} );

		it( 'standalone title is "New post"', () => {
			const t = getTranslate();
			expect( mastodonComposerConfig.copy.title( standaloneMode, t ) ).toBe( 'New post' );
		} );

		it( 'reply placeholder mentions the handle', () => {
			const t = getTranslate();
			const placeholder = mastodonComposerConfig.copy.placeholder( replyMode, t, 'alice' );
			expect( placeholder ).toContain( 'alice' );
		} );
	} );
} );
