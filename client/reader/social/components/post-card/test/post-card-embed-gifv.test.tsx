/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { PostCardEmbedGifv } from '../post-card-embed-gifv';
import type { SocialEmbedGifv } from '../../../types';

const EMBED: SocialEmbedGifv = {
	type: 'gifv',
	src: 'https://cdn/gif.mp4',
	thumbnail: 'https://cdn/gif.jpg',
	alt: 'A waving cat',
	aspect_ratio: { width: 4, height: 3 },
};

// Mock the @wordpress/compose hook directly — `useMediaQuery` snapshots
// matchMedia synchronously on first render, so setting `window.matchMedia`
// per-test from a beforeEach doesn't propagate. Mocking the hook keeps the
// test focused on PostCardEmbedGifv's own branching.
let mockReducedMotion = false;
jest.mock( '@wordpress/compose', () => ( {
	...jest.requireActual( '@wordpress/compose' ),
	useReducedMotion: () => mockReducedMotion,
} ) );

describe( 'PostCardEmbedGifv', () => {
	beforeEach( () => {
		mockReducedMotion = false;
	} );

	it( 'autoplays muted in a loop with playsInline + poster', () => {
		render( <PostCardEmbedGifv embed={ EMBED } /> );
		const video = screen.getByLabelText( 'A waving cat' ) as HTMLVideoElement;
		expect( video.autoplay ).toBe( true );
		expect( video.muted ).toBe( true );
		expect( video.loop ).toBe( true );
		expect( video.playsInline ).toBe( true );
		expect( video.poster ).toContain( 'gif.jpg' );
		expect( video.controls ).toBe( false );
	} );

	it( 'falls back to native controls when prefers-reduced-motion is set', () => {
		mockReducedMotion = true;
		render( <PostCardEmbedGifv embed={ EMBED } /> );
		const video = screen.getByLabelText( 'A waving cat' ) as HTMLVideoElement;
		expect( video.autoplay ).toBe( false );
		expect( video.controls ).toBe( true );
		expect( video.poster ).toContain( 'gif.jpg' );
	} );

	it( 'omits aria-label when alt is empty (avoids invalid aria-label="")', () => {
		const { container } = render( <PostCardEmbedGifv embed={ { ...EMBED, alt: '' } } /> );
		const video = container.querySelector( 'video' ) as HTMLVideoElement;
		expect( video ).not.toBeNull();
		expect( video.hasAttribute( 'aria-label' ) ).toBe( false );
	} );
} );
