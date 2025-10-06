import { render } from '@testing-library/react';
import OverviewFlexUsageCard from '.';

const site = {
	ID: 1,
	slug: 'example.wordpress.com',
} as any;

describe( 'OverviewFlexUsageCard', () => {
	it( 'renders without crashing and shows title', () => {
		const { getByText } = render( <OverviewFlexUsageCard site={ site } /> );
		expect( getByText( /Month-to-date site usage/i ) ).toBeVisible();
	} );
} );
