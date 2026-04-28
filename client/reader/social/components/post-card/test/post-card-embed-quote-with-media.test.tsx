/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { PostCardEmbedQuoteWithMedia } from '../post-card-embed-quote-with-media';
import type { AtmosphereFeedItem } from '@automattic/api-core';

const innerPost: AtmosphereFeedItem = {
	uri: 'at://did:plc:abc/app.bsky.feed.post/q',
	cid: 'c',
	author: { did: 'did:plc:abc', handle: 'q.bsky.social', display_name: 'Q', avatar: null },
	created_at: '',
	indexed_at: '',
	text: 'quoted',
	html: '<p>quoted</p>',
	lang: [],
	reply_parent: null,
	reply_root: null,
	reason: null,
	embed: null,
	counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
	bluesky_url: 'https://bsky.app/profile/q.bsky.social/post/q',
};

describe( 'PostCardEmbedQuoteWithMedia', () => {
	it( 'renders inner quote + image grid', () => {
		render(
			<PostCardEmbedQuoteWithMedia
				embed={ {
					type: 'quote_with_media',
					post: innerPost,
					media: {
						type: 'images',
						images: [
							{
								thumb: 'https://x/t.jpg',
								fullsize: 'https://x/f.jpg',
								alt: 'pic',
								aspect_ratio: null,
							},
						],
					},
				} }
				parentPostUri="at://parent"
			/>
		);
		expect( screen.getByText( 'quoted' ) ).toBeVisible();
		expect( screen.getByRole( 'img', { name: 'pic' } ) ).toBeVisible();
	} );

	it( 'renders inner quote + video thumb', () => {
		render(
			<PostCardEmbedQuoteWithMedia
				embed={ {
					type: 'quote_with_media',
					post: innerPost,
					media: {
						type: 'video',
						playlist: 'https://x/p.m3u8',
						thumbnail: 'https://x/t.jpg',
						alt: 'vid',
						aspect_ratio: null,
					},
				} }
				parentPostUri="at://parent"
			/>
		);
		expect( screen.getByText( 'quoted' ) ).toBeVisible();
		expect( screen.getByRole( 'img', { name: /vid/i } ) ).toBeVisible();
		expect( screen.getByText( '▶' ) ).toBeVisible();
	} );

	it( 'still renders the quote when media is null', () => {
		render(
			<PostCardEmbedQuoteWithMedia
				embed={ { type: 'quote_with_media', post: innerPost, media: null } }
				parentPostUri="at://parent"
			/>
		);
		expect( screen.getByText( 'quoted' ) ).toBeVisible();
	} );
} );
