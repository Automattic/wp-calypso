/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { PostCardEmbedAudio } from '../post-card-embed-audio';
import type { SocialEmbedAudio } from '../../../types';

const EMBED: SocialEmbedAudio = {
	type: 'audio',
	src: 'https://cdn/clip.mp3',
	alt: 'Voice memo about cats',
	duration_seconds: 42,
};

describe( 'PostCardEmbedAudio', () => {
	it( 'renders an audio element with controls', () => {
		render( <PostCardEmbedAudio embed={ EMBED } /> );
		const audio = document.querySelector( 'audio' ) as HTMLAudioElement;
		expect( audio ).not.toBeNull();
		expect( audio.controls ).toBe( true );
		expect( audio.src ).toContain( 'clip.mp3' );
	} );

	it( 'sets aria-label to the alt text', () => {
		render( <PostCardEmbedAudio embed={ EMBED } /> );
		expect( screen.getByLabelText( 'Voice memo about cats' ) ).toBeVisible();
	} );
} );
