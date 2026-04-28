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

describe( 'PostCardEmbedGifv', () => {
	it( 'renders a video element with autoplay, muted, loop, playsInline', () => {
		render( <PostCardEmbedGifv embed={ EMBED } /> );
		const video = document.querySelector( 'video' ) as HTMLVideoElement;
		expect( video ).not.toBeNull();
		expect( video.autoplay ).toBe( true );
		expect( video.muted ).toBe( true );
		expect( video.loop ).toBe( true );
		expect( video.playsInline ).toBe( true );
		expect( video.poster ).toContain( 'gif.jpg' );
	} );

	it( 'sets aria-label to the alt text', () => {
		render( <PostCardEmbedGifv embed={ EMBED } /> );
		expect( screen.getByLabelText( 'A waving cat' ) ).toBeVisible();
	} );
} );
