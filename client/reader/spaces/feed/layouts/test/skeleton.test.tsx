/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { BoardSkeleton } from '../board';
import { GallerySkeleton } from '../gallery';
import { getLayoutSkeleton } from '../registry';
import { StandardListSkeleton } from '../standard-list';

describe( 'getLayoutSkeleton', () => {
	it( 'maps each curated layout to its skeleton', () => {
		expect( getLayoutSkeleton( 'standard-list' ) ).toBe( StandardListSkeleton );
		expect( getLayoutSkeleton( 'gallery' ) ).toBe( GallerySkeleton );
		expect( getLayoutSkeleton( 'board' ) ).toBe( BoardSkeleton );
	} );

	it( 'has no skeleton for the legacy layout or an unknown value', () => {
		// Legacy owns its own loading via ReaderStreamV2.
		expect( getLayoutSkeleton( 'legacy' ) ).toBeUndefined();
		expect( getLayoutSkeleton( undefined ) ).toBeUndefined();
	} );
} );

describe( 'layout skeletons', () => {
	it( 'renders the requested number of placeholder rows', () => {
		const { container } = render( <StandardListSkeleton count={ 4 } /> );

		expect( container.querySelectorAll( '.space-feed-standard-list__skeleton-row' ) ).toHaveLength(
			4
		);
	} );

	it( 'renders the requested number of placeholder cards', () => {
		const { container } = render( <BoardSkeleton count={ 5 } /> );

		expect( container.querySelectorAll( '.space-feed-board__card' ) ).toHaveLength( 5 );
	} );
} );
