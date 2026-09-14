/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ThreadTombstone } from '../thread-tombstone';

describe( 'ThreadTombstone', () => {
	it( 'renders a not_found tombstone with the unavailable copy', () => {
		render( <ThreadTombstone kind="not_found" /> );
		expect( screen.getByRole( 'note' ) ).toHaveTextContent( 'Post unavailable' );
	} );

	it( 'renders a blocked tombstone with the blocked-author copy', () => {
		render( <ThreadTombstone kind="blocked" /> );
		expect( screen.getByRole( 'note' ) ).toHaveTextContent( 'Post is from a blocked author' );
	} );

	it( 'has no anchors', () => {
		const { container } = render( <ThreadTombstone kind="not_found" /> );
		expect( container.querySelectorAll( 'a' ) ).toHaveLength( 0 );
	} );
} );
