/**
 * @jest-environment jsdom
 */
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { addImageCarousel } from '..';

function imageBlock( caption: string ) {
	const figure = document.createElement( 'figure' );
	const img = document.createElement( 'img' );
	img.src = 'https://example.com/1.jpg';
	img.dataset.imageCaption = caption;
	figure.appendChild( img );
	document.body.appendChild( figure );
	return figure;
}

describe( 'addImageCarousel', () => {
	it( 'shows a Jetpack caption as plain text, with its entities decoded', async () => {
		const block = imageBlock( '<p>Harbour&#8217;s <em>best</em> view</p>' );
		addImageCarousel( [ block ] );

		await userEvent.click( block.querySelector( 'img' )! );

		await waitFor( () =>
			expect( document.querySelector( '.reader-image-carousel-caption' )?.innerHTML ).toBe(
				'Harbour’s best view'
			)
		);
	} );
} );
