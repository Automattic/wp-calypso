/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { PostCardEmbedQuote } from '../post-card-embed-quote';
import type { AtmosphereFeedItem } from '@automattic/api-core';

const innerPost: AtmosphereFeedItem = {
	uri: 'at://did:plc:abc/app.bsky.feed.post/inner',
	cid: 'c',
	author: { did: 'did:plc:abc', handle: 'inner.bsky.social', display_name: 'Inner', avatar: null },
	created_at: '2026-04-27T09:00:00Z',
	indexed_at: '2026-04-27T09:00:00Z',
	text: 'inner text',
	html: '<p>inner text</p>',
	lang: [],
	reply_parent: null,
	reply_root: null,
	reason: null,
	embed: null,
	counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
	bluesky_url: 'https://bsky.app/profile/inner.bsky.social/post/inner',
};

describe( 'PostCardEmbedQuote', () => {
	it( 'renders a tombstone for a not_found quote', () => {
		render(
			<PostCardEmbedQuote
				embed={ {
					type: 'quote',
					post: { type: 'not_found', uri: 'at://x', reason: 'notfound' },
				} }
				parentPostUri="at://parent"
			/>
		);
		expect( screen.getByText( /unavailable/i ) ).toBeVisible();
	} );

	it( 'renders a tombstone for a blocked quote', () => {
		render(
			<PostCardEmbedQuote
				embed={ { type: 'quote', post: { type: 'blocked', uri: 'at://y', reason: 'blocked' } } }
				parentPostUri="at://parent"
			/>
		);
		expect( screen.getByText( /blocked author/i ) ).toBeVisible();
	} );

	it( 'renders the inner post for a live quote', () => {
		render(
			<PostCardEmbedQuote
				embed={ { type: 'quote', post: innerPost } }
				parentPostUri="at://parent"
			/>
		);
		expect( screen.getByText( 'inner text' ) ).toBeVisible();
		expect( screen.getByText( '@inner.bsky.social' ) ).toBeVisible();
	} );
} );
