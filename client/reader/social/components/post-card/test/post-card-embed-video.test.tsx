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
		expect( screen.queryByLabelText( /cute cat|bluesky video/i )?.tagName ).not.toBe( 'VIDEO' );
	} );

	it( 'renders a video element when expanded', () => {
		render( <PostCardEmbedVideo embed={ embed } expanded /> );
		const video = screen.getByLabelText( 'Cute cat' );
		expect( video.tagName ).toBe( 'VIDEO' );
		expect( video ).toHaveAttribute( 'poster', embed.thumbnail );
		expect( video ).toHaveAttribute( 'controls' );
		expect( video ).toHaveAttribute( 'playsinline' );
		expect( video ).toHaveAttribute( 'preload', 'metadata' );
	} );

	it( 'falls back to a generic accessible label when alt is empty', () => {
		const noAlt: AtmosphereEmbedVideo = { ...embed, alt: '' };
		render( <PostCardEmbedVideo embed={ noAlt } expanded /> );
		expect( screen.getByLabelText( /bluesky video/i ).tagName ).toBe( 'VIDEO' );
	} );

	it( 'falls back to a generic alt on the thumbnail so screen readers know it is a video', () => {
		const noAlt: AtmosphereEmbedVideo = { ...embed, alt: '' };
		render( <PostCardEmbedVideo embed={ noAlt } /> );
		// Without this, an alt="" thumbnail would be marked decorative and
		// screen-reader users would have no signal that the card carries a
		// video at all.
		const img = screen.getByRole( 'img', { name: /bluesky video/i } );
		expect( img ).toHaveAttribute( 'src', embed.thumbnail );
	} );

	it( 'sets the playlist as src on browsers with native HLS support', () => {
		const original = window.HTMLMediaElement.prototype.canPlayType;
		// Simulate Safari-class browser (native HLS).
		window.HTMLMediaElement.prototype.canPlayType = function ( type: string ) {
			return type === 'application/vnd.apple.mpegurl' ? 'maybe' : '';
		};
		try {
			render( <PostCardEmbedVideo embed={ embed } expanded /> );
			const video = screen.getByLabelText( 'Cute cat' ) as HTMLVideoElement;
			expect( video.src ).toBe( embed.playlist );
		} finally {
			window.HTMLMediaElement.prototype.canPlayType = original;
		}
	} );

	it( 'applies the aspect ratio to the container', () => {
		const { container } = render( <PostCardEmbedVideo embed={ embed } expanded /> );
		const wrapper = container.querySelector< HTMLDivElement >( '.social-post-card-embed-video' );
		expect( wrapper?.style.aspectRatio ).toBe( '16 / 9' );
	} );
} );
