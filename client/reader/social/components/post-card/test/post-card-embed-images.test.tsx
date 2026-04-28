/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
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

	it( 'each image is wrapped in an anchor pointing at fullsize', () => {
		render( <PostCardEmbedImages embed={ embed } /> );
		const links = screen.getAllByRole( 'link' );
		expect( links[ 0 ] ).toHaveAttribute( 'href', 'https://x/f1.jpg' );
		expect( links[ 1 ] ).toHaveAttribute( 'href', 'https://x/f2.jpg' );
		links.forEach( ( link ) => {
			expect( link ).toHaveAttribute( 'target', '_blank' );
			expect( link ).toHaveAttribute( 'rel', 'noopener noreferrer' );
		} );
	} );
} );
