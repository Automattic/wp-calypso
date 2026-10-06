/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import VideoSummary from '../video-summary';

jest.mock( 'calypso/components/data/query-site-stats', () => () => null );
jest.mock( 'calypso/state/ui/selectors', () => ( { getSelectedSiteId: () => 123 } ) );

let mockData: unknown;
jest.mock( 'calypso/state/stats/lists/selectors', () => ( {
	getSiteStatsNormalizedData: () => mockData,
	hasSiteStatsQueryFailed: () => false,
	isRequestingSiteStatsForQuery: () => false,
} ) );

jest.mock( '../../stats-period-navigation', () => () => null );
jest.mock( '../../stats-date-label', () => () => null );

let mockChartProps: { data: Array< { formattedValue?: string } > };
jest.mock( '../../stats-summary', () => ( props: typeof mockChartProps ) => {
	mockChartProps = props;
	return null;
} );

function renderSummary( rows: Array< Record< string, string | number | null > > ) {
	mockData = {
		rows,
		metrics: [ 'plays', 'retention_rate' ],
		post: { post_date: '2026-07-01' },
	};
	return render(
		<Provider store={ createStore( () => ( {} ) ) }>
			<VideoSummary postId={ 1 } initialStatType="retention_rate" />
		</Provider>
	);
}

function retentionTabValue() {
	return screen.getByRole( 'button', { name: /Retention rate/ } ).textContent;
}

describe( 'VideoSummary retention rate', () => {
	it( 'ignores unknown days in the retention card and shows a dash in their tooltip', () => {
		renderSummary( [
			{ period: '2026-07-01', plays: 10, retention_rate: 80 },
			{ period: '2026-07-02', plays: 90, retention_rate: null },
		] );

		expect( retentionTabValue() ).toContain( '80.0%' );
		expect( mockChartProps.data.map( ( record ) => record.formattedValue ) ).toEqual( [
			'80.0%',
			'-',
		] );
	} );

	it( 'shows a dash on the card when every day is unknown', () => {
		renderSummary( [
			{ period: '2026-07-01', plays: 10, retention_rate: null },
			{ period: '2026-07-02', plays: 20, retention_rate: null },
		] );

		expect( retentionTabValue() ).toMatch( /-$/ );
		expect( mockChartProps.data.map( ( record ) => record.formattedValue ) ).toEqual( [
			'-',
			'-',
		] );
	} );

	it( 'treats a known zero retention rate as 0%', () => {
		renderSummary( [ { period: '2026-07-01', plays: 10, retention_rate: 0 } ] );

		expect( retentionTabValue() ).toContain( '0.0%' );
		expect( mockChartProps.data[ 0 ].formattedValue ).toBe( '0.0%' );
	} );
} );
