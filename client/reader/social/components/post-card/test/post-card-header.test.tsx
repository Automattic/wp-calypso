/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { PostCardHeader } from '../post-card-header';
import type { AtmosphereFeedItem } from '@automattic/api-core';

const base: AtmosphereFeedItem = {
	uri: 'at://did:plc:abc/app.bsky.feed.post/x',
	cid: 'c',
	author: { did: 'did:plc:abc', handle: 'alice.bsky.social', display_name: 'Alice', avatar: null },
	created_at: '2026-04-27T10:00:00Z',
	indexed_at: '2026-04-27T10:00:00Z',
	text: '',
	html: '',
	lang: [],
	reply_parent: null,
	reply_root: null,
	reason: null,
	embed: null,
	counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
	bluesky_url: 'https://bsky.app/profile/alice.bsky.social/post/x',
};

describe( 'PostCardHeader', () => {
	it( 'renders display name, handle, and a link to the author profile on bsky.app', () => {
		render( <PostCardHeader post={ base } variant="default" /> );
		expect( screen.getByText( 'Alice' ) ).toBeVisible();
		expect( screen.getByText( '@alice.bsky.social' ) ).toBeVisible();
		const authorLink = screen.getByRole( 'link', { name: /alice/i } );
		expect( authorLink ).toHaveAttribute( 'href', 'https://bsky.app/profile/alice.bsky.social' );
		expect( authorLink ).toHaveAttribute( 'target', '_blank' );
	} );

	it( 'falls back to handle when display_name is empty', () => {
		render(
			<PostCardHeader
				post={ { ...base, author: { ...base.author, display_name: '' } } }
				variant="default"
			/>
		);
		expect( screen.getAllByText( /alice\.bsky\.social/ ).length ).toBeGreaterThan( 0 );
	} );

	it( 'renders the repost reason when post.reason is present', () => {
		render(
			<PostCardHeader
				post={ {
					...base,
					reason: {
						type: 'repost',
						by: { did: 'did:plc:bob', handle: 'bob.bsky.social', display_name: 'Bob' },
					},
				} }
				variant="default"
			/>
		);
		expect( screen.getByText( /Reposted by Bob/ ) ).toBeVisible();
	} );

	it( 'renders the reply context when post.reply_parent is present', () => {
		render(
			<PostCardHeader
				post={ {
					...base,
					reply_parent: {
						uri: 'at://x',
						author: { did: 'did:plc:c', handle: 'carol.bsky.social' },
					},
				} }
				variant="default"
			/>
		);
		expect( screen.getByText( /Replying to @carol\.bsky\.social/ ) ).toBeVisible();
	} );
} );
