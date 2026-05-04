/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { SocialPostCard } from '../index';
import type { SocialPost } from '../../../types';

function makeSocialPost( overrides: Partial< SocialPost > = {} ): SocialPost {
	return {
		uri: 'at://did:plc:default/app.bsky.feed.post/3kdef',
		permalink: 'https://bsky.app/profile/default.bsky.social/post/3kdef',
		author: {
			id: 'did:plc:default',
			handle: 'default.bsky.social',
			display_name: '',
			avatar: null,
			profile_url: 'https://bsky.app/profile/default.bsky.social',
		},
		created_at: '2026-04-28T10:00:00Z',
		indexed_at: '2026-04-28T10:00:00Z',
		text: '',
		html: '<p></p>',
		lang: [],
		reply_parent: null,
		reply_root: null,
		reason: null,
		embed: null,
		counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
		...overrides,
	};
}

const post: SocialPost = {
	uri: 'at://did:plc:abc/app.bsky.feed.post/x',
	author: {
		id: 'did:plc:abc',
		handle: 'alice.bsky.social',
		display_name: 'Alice',
		avatar: null,
		profile_url: 'https://bsky.app/profile/alice.bsky.social',
	},
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
	permalink: 'https://bsky.app/profile/alice.bsky.social/post/x',
};

describe( 'SocialPostCard', () => {
	it( 'renders header, body, counts, and timestamp link in default variant', () => {
		render( <SocialPostCard post={ post } variant="default" /> );
		expect( screen.getByText( 'Alice' ) ).toBeVisible();
		expect( screen.getByText( 'hello' ) ).toBeVisible();
		expect( screen.getByText( /likes:/i ).parentElement ).toHaveTextContent( /likes:\s*3/i );
		// The timestamp link's accessible name is the relative time-ago label;
		// look it up by href rather than text to stay stable across locales.
		const timestampLink = screen
			.getAllByRole( 'link' )
			.find( ( a ) => a.getAttribute( 'href' ) === post.permalink );
		expect( timestampLink ).toBeDefined();
	} );

	it( 'renders an image embed in compact variant (matches bsky.app quote layout)', () => {
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
		expect( screen.getByRole( 'img', { name: 'a' } ) ).toBeVisible();
		expect( screen.queryByText( /likes:/i ) ).toBeNull();
	} );

	it( 'drops nested-quote embeds in compact variant to prevent quote-of-quote chains', () => {
		render(
			<SocialPostCard
				post={ {
					...post,
					embed: {
						type: 'quote',
						post: {
							type: 'not_found',
							uri: 'at://x',
						},
					},
				} }
				variant="compact"
			/>
		);
		expect( screen.queryByRole( 'note' ) ).toBeNull();
		expect( screen.queryByText( /unavailable/i ) ).toBeNull();
	} );

	it( 'compact variant renders no anchors so consumers can wrap it in their own', () => {
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
		expect( document.querySelectorAll( 'a' ) ).toHaveLength( 0 );
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

describe( 'SocialPostCard expandedVideo forwarding', () => {
	const videoPost: SocialPost = makeSocialPost( {
		uri: 'at://did:plc:abc/app.bsky.feed.post/3kabc',
		permalink: 'https://bsky.app/profile/jane.bsky.social/post/3kabc',
		embed: {
			type: 'video',
			playlist: 'https://video.bsky.app/playlist.m3u8',
			thumbnail: 'https://video.bsky.app/thumb.jpg',
			alt: 'A video',
			aspect_ratio: { width: 16, height: 9 },
		},
	} );

	it( 'renders a video element when expandedVideo is true on a video post', () => {
		render( <SocialPostCard post={ videoPost } expandedVideo /> );
		expect( screen.getByLabelText( 'A video' ).tagName ).toBe( 'VIDEO' );
	} );

	it( 'renders only the thumbnail when expandedVideo is unset', () => {
		render( <SocialPostCard post={ videoPost } /> );
		expect( screen.queryByLabelText( 'A video' ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'img', { name: 'A video' } ) ).toBeVisible();
	} );

	it( 'ignores expandedVideo on a non-video embed', () => {
		const imagePost: SocialPost = makeSocialPost( {
			embed: {
				type: 'images',
				images: [ { thumb: 't', fullsize: 'f', alt: 'a', aspect_ratio: null } ],
			},
		} );
		render( <SocialPostCard post={ imagePost } expandedVideo /> );
		expect( screen.queryByLabelText( /bluesky video/i ) ).not.toBeInTheDocument();
	} );
} );

describe( 'SocialPostCard compact + cardLink', () => {
	const compactPost: SocialPost = {
		uri: 'at://x/inner',
		permalink: 'https://bsky.app/x',
		author: {
			id: 'did:plc:x',
			handle: 'x.bsky.social',
			display_name: 'X',
			avatar: null,
			profile_url: 'https://bsky.app/profile/x.bsky.social',
		},
		created_at: '2026-04-28T10:00:00Z',
		indexed_at: '2026-04-28T10:00:00Z',
		text: 'inner',
		html: '<p>inner</p>',
		lang: [],
		reply_parent: null,
		reply_root: null,
		reason: null,
		embed: null,
		counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
	};

	it( 'wraps the compact card in a PostCardLink and renders the timestamp as an anchor when cardLink is set', () => {
		const onClick = jest.fn();
		const { container } = render(
			<SocialPostCard
				post={ compactPost }
				variant="compact"
				cardLink={ { href: '/in-app/thread', onClick } }
			/>
		);
		expect( container.querySelector( '.social-post-card-link' ) ).not.toBeNull();
		const link = screen.getByRole( 'link' );
		expect( link ).toHaveAttribute( 'href', '/in-app/thread' );
	} );

	it( 'renders the compact card without a card-link anchor when cardLink is omitted', () => {
		render( <SocialPostCard post={ compactPost } variant="compact" /> );
		expect( screen.queryByRole( 'link' ) ).toBeNull();
	} );
} );
