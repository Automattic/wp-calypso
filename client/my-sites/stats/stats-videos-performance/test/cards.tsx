/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import VideosPerformanceCards from '../cards';
import type { PerformanceTotals } from '../aggregate';

const totals: PerformanceTotals = {
	views: 1234,
	impressions: 8307,
	watch_time: 2.61,
	retention_rate: 84.6,
};

describe( 'VideosPerformanceCards', () => {
	it( 'renders the four metric cards', () => {
		render( <VideosPerformanceCards totals={ totals } isLoading={ false } /> );

		expect( screen.getByText( 'Views' ) ).toBeVisible();
		expect( screen.getByText( 'Impressions' ) ).toBeVisible();
		expect( screen.getByText( 'Hours watched' ) ).toBeVisible();
		expect( screen.getByText( 'Retention rate' ) ).toBeVisible();
	} );

	it( 'formats each metric value', () => {
		render( <VideosPerformanceCards totals={ totals } isLoading={ false } /> );

		expect( screen.getByText( '1.2K' ) ).toBeVisible(); // views, compact
		expect( screen.getByText( '8.3K' ) ).toBeVisible(); // impressions, compact
		expect( screen.getByText( '2.6' ) ).toBeVisible(); // hours watched, 1 decimal
		expect( screen.getByText( '85%' ) ).toBeVisible(); // retention 84.6 rounded to 85
	} );

	it( 'shows placeholders while loading', () => {
		render( <VideosPerformanceCards totals={ totals } isLoading /> );

		expect( screen.queryByText( '1.2K' ) ).not.toBeInTheDocument();
		expect( screen.getAllByText( '-' ) ).toHaveLength( 4 );
	} );

	it( 'shows a dash for retention when it cannot be computed', () => {
		render(
			<VideosPerformanceCards totals={ { ...totals, retention_rate: null } } isLoading={ false } />
		);

		expect( screen.getByText( '1.2K' ) ).toBeVisible();
		expect( screen.getByText( '-' ) ).toBeVisible();
	} );
} );
