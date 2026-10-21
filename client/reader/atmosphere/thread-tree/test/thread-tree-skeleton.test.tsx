/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ThreadTreeSkeleton } from '../thread-tree-skeleton';

describe( 'ThreadTreeSkeleton', () => {
	it( 'renders an aria-busy status region with loading copy', () => {
		render( <ThreadTreeSkeleton /> );
		const status = screen.getByRole( 'status' );
		expect( status ).toHaveTextContent( /loading/i );
		expect( status ).toHaveAttribute( 'aria-busy', 'true' );
	} );

	it( 'renders three skeleton rows (one large + two small)', () => {
		const { container } = render( <ThreadTreeSkeleton /> );
		const rows = container.querySelectorAll( '.thread-tree-skeleton__row' );
		expect( rows ).toHaveLength( 3 );
		expect( rows[ 0 ].classList.contains( 'thread-tree-skeleton__row--large' ) ).toBe( true );
	} );
} );
