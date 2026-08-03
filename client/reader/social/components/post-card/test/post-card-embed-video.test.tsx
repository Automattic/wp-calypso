/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Hls from 'hls.js';
import { PostCardEmbedVideo } from '../post-card-embed-video';
import type { AtmosphereEmbedVideo } from '@automattic/api-core';

const mockHls = {
	loadSource: jest.fn(),
	attachMedia: jest.fn(),
	destroy: jest.fn(),
};

jest.mock( 'hls.js', () => {
	const HlsCtor = jest.fn().mockImplementation( () => mockHls );
	( HlsCtor as unknown as { isSupported: () => boolean } ).isSupported = () => true;
	return { __esModule: true, default: HlsCtor };
} );

const HlsMock = Hls as unknown as jest.Mock;

const embed: AtmosphereEmbedVideo = {
	type: 'video',
	playlist: 'https://video.bsky.app/playlist.m3u8',
	thumbnail: 'https://video.bsky.app/thumb.jpg',
	alt: 'Cute cat',
	aspect_ratio: { width: 16, height: 9 },
};

describe( 'PostCardEmbedVideo', () => {
	// JSDOM's HTMLMediaElement.play returns undefined; the spec says it
	// returns a Promise. Stub a resolved promise so production code's
	// `video.play().catch(...)` doesn't crash in the default test path.
	let originalPlay: typeof window.HTMLMediaElement.prototype.play;
	let playMock: jest.Mock< Promise< void >, [] >;
	beforeEach( () => {
		originalPlay = window.HTMLMediaElement.prototype.play;
		playMock = jest.fn< Promise< void >, [] >().mockResolvedValue( undefined );
		window.HTMLMediaElement.prototype.play = playMock;
		HlsMock.mockClear();
		mockHls.loadSource.mockClear();
		mockHls.attachMedia.mockClear();
		mockHls.destroy.mockClear();
	} );
	afterEach( () => {
		window.HTMLMediaElement.prototype.play = originalPlay;
	} );

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

	it( 'renders the thumbnail as a button so clicks expand the player inline', () => {
		render( <PostCardEmbedVideo embed={ embed } /> );
		const button = screen.getByRole( 'button', { name: /play video/i } );
		expect( button ).toBeVisible();
	} );

	it( 'replaces the thumbnail with a video element when the user clicks play', async () => {
		const user = userEvent.setup();
		render( <PostCardEmbedVideo embed={ embed } /> );

		expect( screen.queryByLabelText( 'Cute cat' ) ).not.toBeInTheDocument();

		await user.click( screen.getByRole( 'button', { name: /play video/i } ) );

		const video = screen.getByLabelText( 'Cute cat' );
		expect( video.tagName ).toBe( 'VIDEO' );
	} );

	it( 'does not autoplay when expanded via the prop (thread root)', () => {
		const originalCanPlayType = window.HTMLMediaElement.prototype.canPlayType;
		window.HTMLMediaElement.prototype.canPlayType = function ( type: string ) {
			return type === 'application/vnd.apple.mpegurl' ? 'maybe' : '';
		};
		try {
			render( <PostCardEmbedVideo embed={ embed } expanded /> );
			expect( playMock ).not.toHaveBeenCalled();
		} finally {
			window.HTMLMediaElement.prototype.canPlayType = originalCanPlayType;
		}
	} );

	it( 'autoplays after attachMedia on the hls.js branch when the thumbnail is clicked', async () => {
		const user = userEvent.setup();
		const originalCanPlayType = window.HTMLMediaElement.prototype.canPlayType;
		// Force the non-Safari branch so the dynamic hls.js import path runs.
		window.HTMLMediaElement.prototype.canPlayType = () => '';
		try {
			render( <PostCardEmbedVideo embed={ embed } /> );
			await user.click( screen.getByRole( 'button', { name: /play video/i } ) );
			await waitFor( () => expect( mockHls.attachMedia ).toHaveBeenCalledTimes( 1 ) );
			await waitFor( () => expect( playMock ).toHaveBeenCalledTimes( 1 ) );
			expect( mockHls.loadSource ).toHaveBeenCalledWith( embed.playlist );
		} finally {
			window.HTMLMediaElement.prototype.canPlayType = originalCanPlayType;
		}
	} );

	it( 'requests playback inside the user-gesture window when the thumbnail is clicked', async () => {
		const user = userEvent.setup();
		const originalCanPlayType = window.HTMLMediaElement.prototype.canPlayType;
		// Take the native-HLS branch so play() is invoked synchronously
		// inside the same effect tick that flips the embed open, mirroring
		// the user-gesture window the production code relies on.
		window.HTMLMediaElement.prototype.canPlayType = function ( type: string ) {
			return type === 'application/vnd.apple.mpegurl' ? 'maybe' : '';
		};
		try {
			render( <PostCardEmbedVideo embed={ embed } /> );
			await user.click( screen.getByRole( 'button', { name: /play video/i } ) );
			expect( playMock ).toHaveBeenCalledTimes( 1 );
		} finally {
			window.HTMLMediaElement.prototype.canPlayType = originalCanPlayType;
		}
	} );
} );
