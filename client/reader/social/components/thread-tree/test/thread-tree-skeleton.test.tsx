/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ThreadTreeSkeleton } from '../thread-tree-skeleton';

describe( 'ThreadTreeSkeleton', () => {
	it( 'renders an aria-live status region with loading copy', () => {
		render( <ThreadTreeSkeleton /> );
		expect( screen.getByRole( 'status' ) ).toHaveTextContent( /loading/i );
	} );

	it( 'renders three skeleton rows (one large + two small)', () => {
		const { container } = render( <ThreadTreeSkeleton /> );
		const rows = container.querySelectorAll( '.thread-tree-skeleton__row' );
		expect( rows ).toHaveLength( 3 );
		expect( rows[ 0 ].classList.contains( 'thread-tree-skeleton__row--large' ) ).toBe( true );
	} );
} );
