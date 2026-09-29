/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import VideoPressStatsModule from '..';

jest.mock( 'calypso/components/data/query-site-stats', () => () => null );
jest.mock( 'calypso/my-sites/stats/components/stats-infotip', () => () => null );
jest.mock( 'calypso/state/ui/selectors', () => ( { getSelectedSiteId: () => 123 } ) );
jest.mock( 'calypso/state/sites/selectors', () => ( { getSiteSlug: () => 'example.com' } ) );

let mockData;
jest.mock( 'calypso/state/stats/lists/selectors', () => ( {
	isRequestingSiteStatsForQuery: () => false,
	getVideoPressPlaysComplete: () => mockData,
} ) );

const baseRow = {
	post_id: 1,
	title: 'Video',
	views: 10,
	impressions: 20,
	watch_time: 1.5,
};

function renderModule( rows ) {
	mockData = { period: 'day', days: { '2026-07-24': { data: rows } } };
	return render(
		<Provider store={ createStore( () => ( {} ) ) }>
			<VideoPressStatsModule
				moduleStrings={ { title: 'Videos' } }
				statType="statsVideoPlays"
				query={ { period: 'day', date: '2026-07-24' } }
			/>
		</Provider>
	);
}

describe( 'VideoPressStatsModule retention rate', () => {
	it( 'renders the retention rate as a percentage when known', () => {
		renderModule( [ { ...baseRow, retention_rate: 42 } ] );
		expect( screen.getByText( '42%' ) ).toBeVisible();
	} );

	it( 'renders a known zero retention rate as 0%', () => {
		renderModule( [ { ...baseRow, retention_rate: 0 } ] );
		expect( screen.getByText( '0%' ) ).toBeVisible();
	} );

	it( 'renders n/a when the retention rate is null', () => {
		renderModule( [ { ...baseRow, retention_rate: null } ] );
		expect( screen.getByText( 'n/a' ) ).toBeVisible();
		expect( screen.queryByText( /null/ ) ).not.toBeInTheDocument();
	} );

	it( 'renders n/a when the retention rate is missing', () => {
		renderModule( [ { ...baseRow } ] );
		expect( screen.getByText( 'n/a' ) ).toBeVisible();
	} );
} );
