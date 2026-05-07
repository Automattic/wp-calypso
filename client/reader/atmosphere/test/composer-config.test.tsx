/**
 * @jest-environment jsdom
 */
import { render, renderHook } from '@testing-library/react';
import { useTranslate } from 'i18n-calypso';
import { atmosphereComposerConfig } from '../composer-config';
import type { AtmosphereError } from '@automattic/api-core';
import type { ActiveMode, Translate } from 'calypso/reader/social/composer';

function getTranslate(): Translate {
	const { result } = renderHook( () => useTranslate() );
	return result.current;
}

const previewPost = {
	uri: 'at://did:plc:abcde234567fghij234567ab/app.bsky.feed.post/3kabcdef12345',
	cid: 'parentCid',
	text: 'parent body',
	html: '<p>parent body</p>',
	author: { handle: 'alice.bsky.social', display_name: 'Alice' },
};

const replyMode: ActiveMode = {
	kind: 'reply',
	connectionId: 7,
	root: {
		uri: 'at://did:plc:abcde234567fghij234567ab/app.bsky.feed.post/3kxxrootroot1',
		cid: 'rootCid',
	},
	parent: { uri: previewPost.uri, cid: previewPost.cid },
	previewPost,
};

const quoteMode: ActiveMode = {
	kind: 'quote',
	connectionId: 7,
	quote: { uri: previewPost.uri, cid: previewPost.cid },
	previewPost,
};

const quoteWithReplyMode: ActiveMode = {
	kind: 'quote',
	connectionId: 7,
	quote: { uri: previewPost.uri, cid: previewPost.cid },
	previewPost,
	replyTo: {
		root: {
			uri: 'at://did:plc:xyz567abcde234567fghij56/app.bsky.feed.post/3kyyroot2root2',
			cid: 'rootCid2',
		},
		parent: {
			uri: 'at://did:plc:xyz567abcde234567fghij56/app.bsky.feed.post/3kyypar2parent',
			cid: 'parentCid2',
		},
	},
};

const standaloneMode: ActiveMode = {
	kind: 'standalone',
	connectionId: 7,
	entry_point: 'fab',
};

describe( 'atmosphereComposerConfig', () => {
	describe( 'supportedModes', () => {
		it( 'supports reply, quote, and standalone', () => {
			expect( atmosphereComposerConfig.supportedModes ).toEqual( [
				'reply',
				'quote',
				'standalone',
			] );
		} );
	} );

	describe( 'limit', () => {
		it( 'is 300 (Bluesky character limit)', () => {
			expect( atmosphereComposerConfig.limit ).toBe( 300 );
		} );
	} );

	describe( 'buildParams', () => {
		it( 'reply mode passes the strong-ref shape for root and parent', () => {
			const params = atmosphereComposerConfig.buildParams( replyMode, 'a reply' );
			expect( params ).toEqual( {
				connectionId: 7,
				text: 'a reply',
				reply: {
					root: { uri: replyMode.root.uri, cid: 'rootCid' },
					parent: { uri: replyMode.parent.uri, cid: 'parentCid' },
				},
			} );
		} );

		it( 'quote mode passes the quote ref and omits reply', () => {
			const params = atmosphereComposerConfig.buildParams( quoteMode, 'commentary' );
			expect( params ).toMatchObject( {
				connectionId: 7,
				text: 'commentary',
				quote: { uri: previewPost.uri, cid: 'parentCid' },
			} );
			expect( params ).not.toHaveProperty( 'reply' );
		} );

		it( 'quote-with-reply mode includes both quote and reply refs', () => {
			const params = atmosphereComposerConfig.buildParams( quoteWithReplyMode, 'commentary' );
			expect( params ).toMatchObject( {
				quote: { uri: previewPost.uri, cid: 'parentCid' },
				reply: {
					root: {
						uri: 'at://did:plc:xyz567abcde234567fghij56/app.bsky.feed.post/3kyyroot2root2',
						cid: 'rootCid2',
					},
					parent: {
						uri: 'at://did:plc:xyz567abcde234567fghij56/app.bsky.feed.post/3kyypar2parent',
						cid: 'parentCid2',
					},
				},
			} );
		} );

		it( 'standalone mode contains only connectionId + text', () => {
			const params = atmosphereComposerConfig.buildParams( standaloneMode, 'a post' );
			expect( params ).toEqual( { connectionId: 7, text: 'a post' } );
		} );
	} );

	describe( 'errorMessage', () => {
		const cases: Array< [ AtmosphereError[ 'kind' ], AtmosphereError ] > = [
			[ 'bad_request', { kind: 'bad_request', message: 'x' } ],
			[ 'text_too_long', { kind: 'text_too_long' } ],
			[ 'auth_required', { kind: 'auth_required' } ],
			[ 'auth_failed', { kind: 'auth_failed' } ],
			[ 'invalid_credentials', { kind: 'invalid_credentials' } ],
			[ 'reply_disabled', { kind: 'reply_disabled' } ],
			[ 'quote_disabled', { kind: 'quote_disabled' } ],
			[ 'rate_limited', { kind: 'rate_limited' } ],
			[ 'upstream_unavailable', { kind: 'upstream_unavailable' } ],
			[ 'connection_not_found', { kind: 'connection_not_found' } ],
			[ 'not_found', { kind: 'not_found' } ],
			[ 'target_unavailable', { kind: 'target_unavailable' } ],
			[ 'invalid_handle', { kind: 'invalid_handle' } ],
			[ 'unknown', { kind: 'unknown', cause: null } ],
		];

		it.each( cases )( 'renders non-empty copy for %s', ( _kind, err ) => {
			const t = getTranslate();
			const node = atmosphereComposerConfig.errorMessage( err, t );
			const { container } = render( <span>{ node }</span> );
			expect( container.textContent?.trim().length ).toBeGreaterThan( 0 );
		} );

		it( 'auth_required renders a Reconnect link to /reader/atmosphere/connect', () => {
			const t = getTranslate();
			const node = atmosphereComposerConfig.errorMessage( { kind: 'auth_required' }, t );
			const { container } = render( <span>{ node }</span> );
			const link = container.querySelector( 'a' );
			expect( link?.getAttribute( 'href' ) ).toBe( '/reader/atmosphere/connect' );
		} );
	} );

	describe( 'successNotice', () => {
		it( 'reply threadUrl points at the parent post (DID + rkey)', () => {
			const t = getTranslate();
			const result = {
				uri: 'at://did:plc:me234567abcde234567fghij/app.bsky.feed.post/3kmenewpost12',
				cid: 'newCid',
				rkey: '3kmenewpost12',
			};
			const notice = atmosphereComposerConfig.successNotice( replyMode, result, t );
			expect( notice.threadUrl ).toBe(
				'/reader/atmosphere/7/thread/did:plc:abcde234567fghij234567ab/3kabcdef12345'
			);
		} );

		it( 'standalone threadUrl points at the new post (DID + rkey)', () => {
			const t = getTranslate();
			const result = {
				uri: 'at://did:plc:me234567abcde234567fghij/app.bsky.feed.post/3kmenewpost12',
				cid: 'newCid',
				rkey: '3kmenewpost12',
			};
			const notice = atmosphereComposerConfig.successNotice( standaloneMode, result, t );
			expect( notice.threadUrl ).toBe(
				'/reader/atmosphere/7/thread/did:plc:me234567abcde234567fghij/3kmenewpost12'
			);
		} );
	} );

	describe( 'tracks', () => {
		it( 'opened reply carries parent_uri + root_uri', () => {
			const e = atmosphereComposerConfig.tracks.opened( replyMode );
			expect( e.event ).toBe( 'calypso_reader_atmosphere_reply_composer_opened' );
			expect( e.props ).toMatchObject( {
				connection_id: 7,
				parent_uri: replyMode.parent.uri,
				root_uri: replyMode.root.uri,
			} );
		} );

		it( 'opened quote carries quoted_uri', () => {
			const e = atmosphereComposerConfig.tracks.opened( quoteMode );
			expect( e.event ).toBe( 'calypso_reader_atmosphere_quote_composer_opened' );
			expect( e.props ).toMatchObject( { connection_id: 7, quoted_uri: previewPost.uri } );
		} );

		it( 'opened standalone carries entry_point', () => {
			const e = atmosphereComposerConfig.tracks.opened( standaloneMode );
			expect( e.event ).toBe( 'calypso_reader_atmosphere_compose_opened' );
			expect( e.props ).toMatchObject( { connection_id: 7, entry_point: 'fab' } );
		} );
	} );

	describe( 'copy', () => {
		it( 'reply title is "Reply"', () => {
			const t = getTranslate();
			expect( atmosphereComposerConfig.copy.title( replyMode, t ) ).toBe( 'Reply' );
		} );

		it( 'quote title is "Quote post"', () => {
			const t = getTranslate();
			expect( atmosphereComposerConfig.copy.title( quoteMode, t ) ).toBe( 'Quote post' );
		} );

		it( 'standalone title is "New post"', () => {
			const t = getTranslate();
			expect( atmosphereComposerConfig.copy.title( standaloneMode, t ) ).toBe( 'New post' );
		} );

		it( 'reply placeholder mentions the handle', () => {
			const t = getTranslate();
			const placeholder = atmosphereComposerConfig.copy.placeholder(
				replyMode,
				t,
				'alice.bsky.social'
			);
			expect( placeholder ).toContain( 'alice.bsky.social' );
		} );
	} );
} );
