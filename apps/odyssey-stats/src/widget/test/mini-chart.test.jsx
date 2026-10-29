/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useVisitsQuery from '../../hooks/use-visits-query';
import {
	getDateRange,
	DATE_RANGE_LAST_7_DAYS,
	DATE_RANGE_LAST_90_DAYS,
} from '../../lib/date-ranges';
import MiniChart from '../mini-chart';
import { recordWidgetEventThenFollow } from '../record-widget-event';

let mockChartFails = false;
let mockChartLoading = false;

jest.mock( '../../hooks/use-visits-query' );
jest.mock( 'calypso/my-sites/stats/hooks/use-css-variable', () => () => '#3858e9' );
jest.mock( '../use-stats-link', () => () => ( url ) => url );
jest.mock( '../record-widget-event', () => ( {
	__esModule: true,
	default: jest.fn(),
	recordWidgetEventThenFollow: jest.fn( () => jest.fn() ),
} ) );
jest.mock( '../overview-chart', () => ( {
	__esModule: true,
	default: () => {
		if ( mockChartFails ) {
			throw new Error( 'Loading chunk 9542 failed' );
		}
		// Suspends, as the chart does while its chunk downloads.
		if ( mockChartLoading ) {
			throw new Promise( () => {} );
		}
		return <p>Chart</p>;
	},
} ) );

const days = ( ...rows ) =>
	rows.map( ( [ views, visitors ], index ) => ( {
		period: `2026-10-0${ index + 1 }`,
		views,
		visitors,
	} ) );
const success = ( data ) => ( { status: 'success', data } );
const failed = () => ( { status: 'error' } );
const pending = () => ( { status: 'pending' } );

function renderMiniChart( state, rangeId = DATE_RANGE_LAST_7_DAYS ) {
	useVisitsQuery.mockReturnValue( state );
	const range = { ...getDateRange( rangeId ), startDate: '2026-10-01', endDate: '2026-10-07' };
	return (
		<MiniChart
			siteId={ 1 }
			statsBaseUrl="https://example.com/wp-admin/admin.php?page=stats"
			range={ range }
			gmtOffset={ 0 }
		/>
	);
}

const moreStats = () => screen.queryByRole( 'link', { name: 'More stats' } );

describe( 'MiniChart', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockChartFails = false;
		mockChartLoading = false;
		// Reduced motion lands the totals on their value without counting up.
		window.matchMedia = jest.fn().mockReturnValue( { matches: true } );
		jest.spyOn( console, 'error' ).mockImplementation( () => {} );
	} );

	afterEach( () => {
		// eslint-disable-next-line no-console
		console.error.mockRestore();
	} );

	it( 'opens "More stats" on the days the chart shows', async () => {
		// Each tracked link gets its own handler, so the click can be traced to this one.
		recordWidgetEventThenFollow.mockImplementation( () =>
			jest.fn( ( event ) => event.preventDefault() )
		);
		render( renderMiniChart( success( days( [ 20, 8 ] ) ) ) );
		expect( await screen.findByText( 'Chart' ) ).toBeInTheDocument();

		const link = moreStats();
		expect( link ).toHaveAttribute(
			'href',
			'https://example.com/wp-admin/admin.php?page=stats/stats/day/1?chartStart=2026-10-01&chartEnd=2026-10-07'
		);
		expect( recordWidgetEventThenFollow ).toHaveBeenCalledWith( 'more_stats_clicked', {
			range: DATE_RANGE_LAST_7_DAYS,
		} );

		// The handler from the latest render: the chart's arrival rendered the link again.
		await userEvent.setup().click( link );
		expect( recordWidgetEventThenFollow.mock.results.at( -1 ).value ).toHaveBeenCalled();
	} );

	it( 'draws the outline of the totals and the chart while the range loads', () => {
		const { container } = render( renderMiniChart( pending() ) );

		expect( screen.getByText( 'Loading…' ) ).toHaveClass( 'screen-reader-text' );
		expect( container.querySelectorAll( '.stats-widget-metric__value-skeleton' ) ).toHaveLength(
			2
		);
		expect( container.querySelector( '.stats-widget-chart__skeleton' ) ).toBeInTheDocument();
		expect( screen.queryByText( '0' ) ).not.toBeInTheDocument();
	} );

	it( 'keeps the place of "More stats" while loading, without showing it', () => {
		render( renderMiniChart( pending() ) );

		expect( moreStats().closest( '.stats-widget-minichart__footer' ) ).toHaveClass( 'is-loading' );
	} );

	it.each( [
		[ 'for an empty range', success( days( [ 0, 0 ] ) ) ],
		[ 'when the request failed', failed() ],
	] )( 'drops "More stats" %s, with nothing to look further into', ( _, state ) => {
		render( renderMiniChart( state ) );

		expect( moreStats() ).not.toBeInTheDocument();
	} );

	it( 'shows "More stats" while the chart itself is still loading', async () => {
		mockChartLoading = true;
		render( renderMiniChart( success( days( [ 20, 8 ] ) ) ) );

		expect( await screen.findByText( '20' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Chart' ) ).not.toBeInTheDocument();
		expect( moreStats() ).toBeVisible();
	} );

	it( 'keeps "More stats" when the chart itself fails', async () => {
		mockChartFails = true;
		render( renderMiniChart( success( days( [ 20, 8 ] ) ) ) );

		expect( await screen.findByText( 'No data to show' ) ).toBeInTheDocument();
		expect( moreStats() ).toBeVisible();
	} );

	it( 'sums the range into the totals and draws the chart', async () => {
		render( renderMiniChart( success( days( [ 20, 8 ], [ 10, 4 ] ) ) ) );

		expect( screen.getByText( '30' ) ).toBeInTheDocument();
		expect( screen.getByText( '12' ) ).toBeInTheDocument();
		expect( await screen.findByText( 'Chart' ) ).toBeInTheDocument();
	} );

	it( 'says no data where the chart failed to load', async () => {
		mockChartFails = true;
		render( renderMiniChart( success( days( [ 20, 8 ] ) ) ) );

		expect( await screen.findByText( 'No data to show' ) ).toBeInTheDocument();
		expect( screen.getByText( '20' ) ).toBeInTheDocument();
	} );

	it( 'says a failed request has no data, rather than that the range is empty', () => {
		render( renderMiniChart( failed() ) );

		expect( screen.getByText( 'No data to show' ) ).toBeInTheDocument();
		expect(
			screen.queryByText( 'We are collecting traffic data for your site' )
		).not.toBeInTheDocument();
		expect( screen.queryByText( 'Views' ) ).not.toBeInTheDocument();
	} );

	it( 'shows the empty notice, without zero totals, for a range with no traffic', () => {
		render( renderMiniChart( success( days( [ 0, 0 ] ) ) ) );

		expect(
			screen.getByText( 'We are collecting traffic data for your site' )
		).toBeInTheDocument();
		expect( screen.queryByText( 'Views' ) ).not.toBeInTheDocument();
	} );

	it( 'keeps loading while a retry waits, rather than reading the range as empty', () => {
		render( renderMiniChart( pending() ) );

		expect( screen.getByText( 'Views' ) ).toBeInTheDocument();
		expect(
			screen.queryByText( 'We are collecting traffic data for your site' )
		).not.toBeInTheDocument();
	} );

	it( 'still reports an empty range after the chart itself has failed', async () => {
		mockChartFails = true;
		const { rerender } = render( renderMiniChart( success( days( [ 20, 8 ] ) ) ) );
		expect( await screen.findByText( 'No data to show' ) ).toBeInTheDocument();

		rerender( renderMiniChart( success( days( [ 0, 0 ] ) ), DATE_RANGE_LAST_90_DAYS ) );

		expect(
			await screen.findByText( 'We are collecting traffic data for your site' )
		).toBeInTheDocument();
	} );
} );
