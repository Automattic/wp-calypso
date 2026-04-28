/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { PostCardEmbedVideo } from '../post-card-embed-video';
import type { AtmosphereEmbedVideo } from '@automattic/api-core';

const embed: AtmosphereEmbedVideo = {
	type: 'video',
	playlist: 'https://video.bsky.app/playlist.m3u8',
	thumbnail: 'https://video.bsky.app/thumb.jpg',
	alt: 'Cute cat',
	aspect_ratio: { width: 16, height: 9 },
};

describe( 'PostCardEmbedVideo', () => {
	it( 'renders a thumbnail in the default (non-expanded) mode', () => {
		render( <PostCardEmbedVideo embed={ embed } /> );
		const img = screen.getByRole( 'img', { name: 'Cute cat' } );
		expect( img ).toHaveAttribute( 'src', embed.thumbnail );
		expect( screen.queryByTitle( /bluesky video/i ) ).not.toBeInTheDocument();
	} );

	it( 'renders the bsky.app iframe when expanded with a parentUrl', () => {
		render(
			<PostCardEmbedVideo
				embed={ embed }
				expanded
				parentUrl="https://bsky.app/profile/jane.bsky.social/post/3kabc"
			/>
		);
		const iframe = screen.getByTitle( 'Cute cat' );
		expect( iframe.tagName ).toBe( 'IFRAME' );
		expect( iframe ).toHaveAttribute(
			'src',
			expect.stringContaining( 'embed.bsky.app/static/embed.html' )
		);
		expect( iframe ).toHaveAttribute( 'sandbox', 'allow-scripts allow-same-origin allow-popups' );
		expect( iframe ).toHaveAttribute( 'allow', 'autoplay; fullscreen; picture-in-picture' );
		expect( iframe ).toHaveAttribute( 'loading', 'lazy' );
	} );

	it( 'falls back to the thumbnail when expanded but parentUrl is missing', () => {
		render( <PostCardEmbedVideo embed={ embed } expanded /> );
		expect( screen.getByRole( 'img', { name: 'Cute cat' } ) ).toBeVisible();
	} );

	it( 'falls back to the thumbnail when expanded with a non-bsky parentUrl', () => {
		render( <PostCardEmbedVideo embed={ embed } expanded parentUrl="https://example.com/x" /> );
		expect( screen.getByRole( 'img', { name: 'Cute cat' } ) ).toBeVisible();
	} );

	it( 'falls back to a generic title when alt is empty', () => {
		const noAlt: AtmosphereEmbedVideo = { ...embed, alt: '' };
		render(
			<PostCardEmbedVideo
				embed={ noAlt }
				expanded
				parentUrl="https://bsky.app/profile/jane.bsky.social/post/3kabc"
			/>
		);
		expect( screen.getByTitle( /bluesky video/i ).tagName ).toBe( 'IFRAME' );
	} );
} );
