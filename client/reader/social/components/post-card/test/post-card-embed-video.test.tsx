/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { PostCardEmbedVideo } from '../post-card-embed-video';

const embed = {
	type: 'video' as const,
	playlist: 'https://x/playlist.m3u8',
	thumbnail: 'https://x/thumb.jpg',
	alt: 'a video',
	aspect_ratio: { width: 16, height: 9 },
};

describe( 'PostCardEmbedVideo', () => {
	it( 'renders the thumbnail with alt text', () => {
		render( <PostCardEmbedVideo embed={ embed } /> );
		const img = screen.getByRole( 'img', { name: /a video/i } );
		expect( img ).toHaveAttribute( 'src', embed.thumbnail );
	} );

	it( 'renders the play overlay', () => {
		render( <PostCardEmbedVideo embed={ embed } /> );
		expect( screen.getByText( '▶' ) ).toBeVisible();
	} );

	it( 'is not itself an anchor (click bubbles to parent card-link)', () => {
		const { container } = render( <PostCardEmbedVideo embed={ embed } /> );
		expect( container.querySelector( 'a' ) ).toBeNull();
	} );
} );
