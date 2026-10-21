/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { PostCardEmbed } from '../post-card-embed';
import type { SocialEmbed } from '../../../types';

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
					post: { type: 'not_found', uri: 'at://x' },
				} }
				parentPostUri="at://parent"
			/>
		);
		expect( screen.getByText( /unavailable/i ) ).toBeVisible();
	} );

	it( 'dispatches gifv embeds to PostCardEmbedGifv', () => {
		const embed: SocialEmbed = {
			type: 'gifv',
			src: 'https://cdn/g.mp4',
			thumbnail: 'https://cdn/g.jpg',
			alt: 'gif',
			aspect_ratio: null,
		};
		render( <PostCardEmbed embed={ embed } parentPostUri="x" /> );
		expect( ( screen.getByLabelText( 'gif' ) as HTMLElement ).tagName ).toBe( 'VIDEO' );
	} );

	it( 'dispatches audio embeds to PostCardEmbedAudio', () => {
		const embed: SocialEmbed = {
			type: 'audio',
			src: 'https://cdn/a.mp3',
			alt: 'audio',
			duration_seconds: null,
		};
		render( <PostCardEmbed embed={ embed } parentPostUri="x" /> );
		expect( ( screen.getByLabelText( 'audio' ) as HTMLElement ).tagName ).toBe( 'AUDIO' );
	} );
} );
