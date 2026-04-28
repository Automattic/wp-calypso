/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostCardEmbedImages } from '../post-card-embed-images';

const embed = {
	type: 'images' as const,
	images: [
		{
			thumb: 'https://x/t1.jpg',
			fullsize: 'https://x/f1.jpg',
			alt: 'first',
			aspect_ratio: { width: 1, height: 1 },
		},
		{
			thumb: 'https://x/t2.jpg',
			fullsize: 'https://x/f2.jpg',
			alt: 'second',
			aspect_ratio: null,
		},
	],
};

describe( 'PostCardEmbedImages', () => {
	it( 'renders one img per source with alt text', () => {
		render( <PostCardEmbedImages embed={ embed } /> );
		const imgs = screen.getAllByRole( 'img' );
		expect( imgs ).toHaveLength( 2 );
		expect( imgs[ 0 ] ).toHaveAttribute( 'alt', 'first' );
		expect( imgs[ 1 ] ).toHaveAttribute( 'alt', 'second' );
	} );

	it( 'wraps each image in a button (no anchors) so opening the carousel does not navigate', () => {
		render( <PostCardEmbedImages embed={ embed } /> );
		expect( screen.queryAllByRole( 'link' ) ).toHaveLength( 0 );
		expect( screen.getAllByRole( 'button' ) ).toHaveLength( 2 );
	} );

	it( 'opens the ImageCarousel overlay at the clicked index', async () => {
		const user = userEvent.setup();
		render( <PostCardEmbedImages embed={ embed } /> );
		// Carousel is closed initially: only the two thumbnails are visible.
		expect( screen.queryAllByRole( 'img' ) ).toHaveLength( 2 );

		await user.click( screen.getAllByRole( 'button' )[ 1 ] );

		// Carousel opens and renders the requested fullsize image alongside
		// the original thumbnails.
		const imgs = screen.getAllByRole( 'img' );
		expect( imgs.some( ( img ) => img.getAttribute( 'src' ) === 'https://x/f2.jpg' ) ).toBe( true );

		// And exposes a Close control.
		expect( screen.getByRole( 'button', { name: /close/i } ) ).toBeVisible();
	} );

	it( 'in compact mode renders inert <div>s with no buttons or anchors', () => {
		render( <PostCardEmbedImages embed={ embed } compact /> );
		expect( screen.queryAllByRole( 'button' ) ).toHaveLength( 0 );
		expect( screen.queryAllByRole( 'link' ) ).toHaveLength( 0 );
		expect( screen.getAllByRole( 'img' ) ).toHaveLength( 2 );
	} );

	it( 'uses the per-image alt text in the button accessible name when available', () => {
		render( <PostCardEmbedImages embed={ embed } /> );
		expect( screen.getByRole( 'button', { name: /first/i } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /second/i } ) ).toBeVisible();
	} );

	it( 'falls back to a positional label when alt text is missing', () => {
		const noAlt = {
			...embed,
			images: embed.images.map( ( img ) => ( { ...img, alt: '' } ) ),
		};
		render( <PostCardEmbedImages embed={ noAlt } /> );
		expect( screen.getByRole( 'button', { name: /view image 1 of 2/i } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /view image 2 of 2/i } ) ).toBeVisible();
	} );
} );
