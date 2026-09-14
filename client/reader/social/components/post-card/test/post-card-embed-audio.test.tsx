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
	it( 'renders native controls and exposes alt as the accessible name', () => {
		render( <PostCardEmbedAudio embed={ EMBED } /> );
		const audio = screen.getByLabelText( 'Voice memo about cats' ) as HTMLAudioElement;
		expect( audio.controls ).toBe( true );
		expect( audio.src ).toContain( 'clip.mp3' );
	} );

	it( 'omits aria-label when alt is empty (avoids invalid aria-label="")', () => {
		const { container } = render( <PostCardEmbedAudio embed={ { ...EMBED, alt: '' } } /> );
		const audio = container.querySelector( 'audio' ) as HTMLAudioElement;
		expect( audio ).not.toBeNull();
		expect( audio.hasAttribute( 'aria-label' ) ).toBe( false );
	} );
} );
