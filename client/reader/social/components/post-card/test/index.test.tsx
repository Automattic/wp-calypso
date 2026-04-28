/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { SocialPostCard } from '../index';
import type { AtmosphereFeedItem } from '@automattic/api-core';

const post: AtmosphereFeedItem = {
	uri: 'at://did:plc:abc/app.bsky.feed.post/x',
	cid: 'c',
	author: { did: 'did:plc:abc', handle: 'alice.bsky.social', display_name: 'Alice', avatar: null },
	created_at: '2026-04-27T10:00:00Z',
	indexed_at: '2026-04-27T10:00:00Z',
	text: 'hello',
	html: '<p>hello</p>',
	lang: [ 'en' ],
	reply_parent: null,
	reply_root: null,
	reason: null,
	embed: null,
	counts: { replies: 1, reposts: 2, likes: 3, quotes: 4 },
	bluesky_url: 'https://bsky.app/profile/alice.bsky.social/post/x',
};

describe( 'SocialPostCard', () => {
	it( 'renders header, body, counts, and timestamp link in default variant', () => {
		render( <SocialPostCard post={ post } variant="default" /> );
		expect( screen.getByText( 'Alice' ) ).toBeVisible();
		expect( screen.getByText( 'hello' ) ).toBeVisible();
		expect( screen.getByText( /likes:/i ).parentElement ).toHaveTextContent( /likes:\s*3/i );
		// The ↗ cue is aria-hidden, so the timestamp link's accessible name is
		// the time-ago label. Find it by href instead of matching the cue.
		const timestampLink = screen
			.getAllByRole( 'link' )
			.find( ( a ) => a.getAttribute( 'href' ) === post.bluesky_url );
		expect( timestampLink ).toBeDefined();
	} );

	it( 'omits embed and counts in compact variant', () => {
		render(
			<SocialPostCard
				post={ {
					...post,
					embed: {
						type: 'images',
						images: [ { thumb: 't', fullsize: 'f', alt: 'a', aspect_ratio: null } ],
					},
				} }
				variant="compact"
			/>
		);
		expect( screen.queryByRole( 'img', { name: 'a' } ) ).toBeNull();
		expect( screen.queryByText( /likes:/i ) ).toBeNull();
	} );

	it( 'compact variant renders no anchors so consumers can wrap it in their own', () => {
		const { container } = render( <SocialPostCard post={ post } variant="compact" /> );
		expect( container.querySelectorAll( 'a' ) ).toHaveLength( 0 );
	} );

	it( 'renders embed when present in default variant', () => {
		render(
			<SocialPostCard
				post={ {
					...post,
					embed: {
						type: 'external',
						uri: 'https://x.example',
						title: 'T',
						description: 'D',
						thumb: null,
					},
				} }
				variant="default"
			/>
		);
		expect( screen.getByText( 'T' ) ).toBeVisible();
	} );
} );
