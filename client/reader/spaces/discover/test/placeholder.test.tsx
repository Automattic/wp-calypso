/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { SpaceDiscoverPlaceholder } from '../placeholder';

describe( 'SpaceDiscoverPlaceholder', () => {
	it( 'renders the coming-soon copy', () => {
		render( <SpaceDiscoverPlaceholder /> );

		expect( screen.getByText( 'Discover is coming soon' ) ).toBeVisible();
		expect( screen.getByText( 'Recommendations for this space will show up here.' ) ).toBeVisible();
	} );
} );
