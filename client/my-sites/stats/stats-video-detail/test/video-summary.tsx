/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { vi } from 'vitest';
import VideoSummary from '../video-summary';
import type { ReactNode } from 'react';

vi.mock( 'calypso/components/data/query-site-stats', () => ( { default: () => null } ) );
vi.mock( 'calypso/state/ui/selectors', () => ( { getSelectedSiteId: () => 123 } ) );

let mockData: unknown;
vi.mock( 'calypso/state/stats/lists/selectors', () => ( {
	getSiteStatsNormalizedData: () => mockData,
	hasSiteStatsQueryFailed: () => false,
	isRequestingSiteStatsForQuery: () => false,
} ) );

// The site's "today", read through the site-zone moment the header clamps on.
let mockSiteToday = '2026-07-02';
vi.mock( '../../hooks/use-moment-site-zone', async () => {
	const { default: moment } = await vi.importActual< { default: typeof import( 'moment' ) } >(
		'moment'
	);
	return {
		useMomentInSite: () => ( dateInput?: string ) => moment( dateInput ?? mockSiteToday ),
	};
} );

vi.mock( '../../stats-period-navigation', () => ( {
	default: ( { children }: { children: ReactNode } ) => children,
} ) );

let mockDateLabelProps: { dateRange?: { chartStart: string; chartEnd: string } };
vi.mock( '../../stats-date-label', () => ( {
	default: ( props: typeof mockDateLabelProps ) => {
		mockDateLabelProps = props;
		return null;
	},
} ) );

let mockChartProps: { data: Array< { formattedValue?: string } > };
vi.mock( '../../stats-summary', () => ( {
	default: ( props: typeof mockChartProps ) => {
		mockChartProps = props;
		return null;
	},
} ) );

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

describe( 'VideoSummary header range', () => {
	it.each( [
		[
			"ends on the site's today, not the end of the period",
			[ '2026-07-01' ],
			'2026-07-02',
			'2026-07-02',
		],
		[
			'never ends before the newest charted bucket',
			[ '2026-07-01', '2026-07-03' ],
			'2026-07-02',
			'2026-07-03',
		],
	] )( '%s', async ( _, periods, siteToday, chartEnd ) => {
		mockSiteToday = siteToday;
		renderSummary( periods.map( ( period ) => ( { period, plays: 1, retention_rate: 50 } ) ) );

		await userEvent.click( screen.getByText( 'Months' ) );

		expect( mockDateLabelProps.dateRange ).toEqual( { chartStart: '2026-07-01', chartEnd } );
	} );
} );
