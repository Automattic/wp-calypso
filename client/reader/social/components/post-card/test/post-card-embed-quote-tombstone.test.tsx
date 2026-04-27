/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { PostCardEmbedQuoteTombstone } from '../post-card-embed-quote-tombstone';

describe( 'PostCardEmbedQuoteTombstone', () => {
	it( 'renders the unavailable copy for a not_found tombstone', () => {
		render(
			<PostCardEmbedQuoteTombstone
				tombstone={ { type: 'not_found', uri: 'at://x', reason: 'notfound' } }
			/>
		);
		expect( screen.getByText( /unavailable/i ) ).toBeVisible();
	} );

	it( 'renders the blocked copy for a blocked tombstone', () => {
		render(
			<PostCardEmbedQuoteTombstone
				tombstone={ { type: 'blocked', uri: 'at://y', reason: 'blocked' } }
			/>
		);
		expect( screen.getByText( /blocked author/i ) ).toBeVisible();
	} );
} );
