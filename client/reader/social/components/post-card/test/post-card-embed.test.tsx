/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { PostCardEmbed } from '../post-card-embed';

describe( 'PostCardEmbed dispatcher', () => {
	it( 'images → grid', () => {
		render(
			<PostCardEmbed
				embed={ {
					type: 'images',
					images: [ { thumb: 't', fullsize: 'f', alt: 'pic', aspect_ratio: null } ],
				} }
				parentPostUri="at://parent"
			/>
		);
		expect( screen.getByRole( 'img', { name: 'pic' } ) ).toBeVisible();
	} );

	it( 'video → thumbnail', () => {
		render(
			<PostCardEmbed
				embed={ { type: 'video', playlist: 'p', thumbnail: 't', alt: 'v', aspect_ratio: null } }
				parentPostUri="at://parent"
			/>
		);
		expect( screen.getByRole( 'img', { name: 'v' } ) ).toBeVisible();
		expect( screen.getByText( '▶' ) ).toBeVisible();
	} );

	it( 'external → link card', () => {
		render(
			<PostCardEmbed
				embed={ {
					type: 'external',
					uri: 'https://x.example',
					title: 'T',
					description: 'D',
					thumb: null,
				} }
				parentPostUri="at://parent"
			/>
		);
		expect( screen.getByText( 'T' ) ).toBeVisible();
		expect( screen.getByText( 'D' ) ).toBeVisible();
	} );

	it( 'quote tombstone → unavailable copy', () => {
		render(
			<PostCardEmbed
				embed={ {
					type: 'quote',
					post: { type: 'not_found', uri: 'at://x', reason: 'notfound' },
				} }
				parentPostUri="at://parent"
			/>
		);
		expect( screen.getByText( /unavailable/i ) ).toBeVisible();
	} );
} );
