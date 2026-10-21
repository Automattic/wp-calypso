/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import StatsPostSummary from '..';

jest.mock( 'calypso/components/data/query-post-stats', () => () => null );

let mockStats;
jest.mock( 'calypso/state/stats/posts/selectors', () => ( {
	getPostStats: () => mockStats,
	isRequestingPostStats: () => false,
} ) );

// The site's "today", read through the site-zone moment the chart clamps on.
let mockSiteToday;
jest.mock( '../../hooks/use-moment-site-zone', () => ( {
	getMomentSiteZone: () => ( dateInput ) =>
		jest.requireActual( 'moment' )( dateInput ?? mockSiteToday ),
} ) );

jest.mock( '../../features/modules/stats-utm', () => () => null );
jest.mock( '../../pages/providers/global-provider', () => ( {
	StatsGlobalValuesContext: jest.requireActual( 'react' ).createContext( false ),
} ) );
jest.mock(
	'../../stats-period-navigation',
	() =>
		( { children } ) =>
			children
);

let mockDateLabelProps;
jest.mock( '../../stats-date-label', () => ( props ) => {
	mockDateLabelProps = props;
	return null;
} );

let mockChartProps;
jest.mock( '../../stats-summary', () => ( props ) => {
	mockChartProps = props;
	return null;
} );

function renderSummary( stats, siteToday ) {
	mockStats = { post: { post_date: '2026-08-15 10:00:00' }, ...stats };
	mockSiteToday = siteToday;
	return render(
		<Provider store={ createStore( () => ( {} ) ) }>
			<StatsPostSummary siteId={ 123 } postId={ 1 } />
		</Provider>
	);
}

const chartedStartDates = () => mockChartProps.data.map( ( record ) => record.startDate );

describe( 'StatsPostSummary Months tab', () => {
	it( 'drops months after the site current month but keeps a current month with no views', async () => {
		renderSummary( { years: { 2026: { total: 2, months: { 8: 2 } } } }, '2026-09-30' );

		await userEvent.click( screen.getByText( 'Months' ) );

		expect( chartedStartDates() ).toEqual( [ '2026-08-01', '2026-09-01' ] );
		expect( mockDateLabelProps.dateRange ).toEqual( {
			chartStart: '2026-08-01',
			chartEnd: '2026-09-30',
		} );
	} );

	it( 'keeps a month with views past the site current month after a timezone change', async () => {
		renderSummary( { years: { 2026: { total: 5, months: { 8: 2, 9: 2, 10: 1 } } } }, '2026-09-30' );

		await userEvent.click( screen.getByText( 'Months' ) );

		expect( chartedStartDates() ).toEqual( [ '2026-08-01', '2026-09-01', '2026-10-01' ] );
		expect( mockDateLabelProps.dateRange ).toEqual( {
			chartStart: '2026-08-01',
			chartEnd: '2026-10-01',
		} );
	} );
} );

describe( 'StatsPostSummary header range', () => {
	it( 'stops an in-progress week at the site today', async () => {
		renderSummary( { data: [ [ '2026-09-28', 1 ] ] }, '2026-09-30' );

		await userEvent.click( screen.getByText( 'Weeks' ) );

		expect( mockDateLabelProps.dateRange ).toEqual( {
			chartStart: '2026-09-28',
			chartEnd: '2026-09-30',
		} );
	} );
} );
