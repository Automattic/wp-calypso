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
let mockChartProps = null;

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
	default: ( props ) => {
		mockChartProps = props;
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

function renderMiniChart( state, rangeId = DATE_RANGE_LAST_7_DAYS, startDate = '2026-10-01' ) {
	useVisitsQuery.mockReturnValue( state );
	const range = { ...getDateRange( rangeId ), startDate, endDate: '2026-10-07' };
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

const mockViewport = ( { reducedMotion, mobile } ) => {
	window.matchMedia = jest.fn( ( query ) => ( {
		matches: query.includes( 'reduced-motion' ) ? reducedMotion : mobile,
	} ) );
};

describe( 'MiniChart', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockChartFails = false;
		mockChartLoading = false;
		mockChartProps = null;
		localStorage.clear();
		// Reduced motion lands the totals on their value without counting up; the viewport
		// is a desktop's unless a test says otherwise.
		mockViewport( { reducedMotion: true, mobile: false } );
		jest.spyOn( console, 'error' ).mockImplementation( () => {} );
	} );

	afterEach( () => {
		// eslint-disable-next-line no-console
		console.error.mockRestore();
	} );

	it.each( [
		[ 'bars, as the Stats page does', null, false, 'bar' ],
		[ 'bars on a phone too, as Stats v2 does', null, true, 'bar' ],
		[ 'lines when the viewer chose them on the Stats page', 'line', false, 'line' ],
		[ 'lines on a phone when the viewer chose them', 'line', true, 'line' ],
		[ 'bars over a value the Stats page never writes', 'pie', false, 'bar' ],
	] )( 'draws %s', async ( _, stored, mobile, expected ) => {
		if ( stored ) {
			localStorage.setItem( 'jetpack_stats_chart_type_1', stored );
		}
		mockViewport( { reducedMotion: true, mobile } );
		const { container } = render( renderMiniChart( success( days( [ 20, 8 ] ) ) ) );
		expect( await screen.findByText( 'Chart' ) ).toBeInTheDocument();

		expect( mockChartProps.chartType ).toBe( expected );
		// The legend swatches match: a square beside bars, a line beside lines.
		const swatches = container.querySelectorAll( '.stats-widget-metric__swatch' );
		expect( swatches ).toHaveLength( 2 );
		swatches.forEach( ( swatch ) =>
			expect( swatch.classList.contains( 'is-bar' ) ).toBe( 'bar' === expected )
		);
	} );

	it( 'asks for the range from its first day, so a week at either end can be partial', () => {
		render( renderMiniChart( success( days( [ 20, 8 ] ) ), DATE_RANGE_LAST_90_DAYS ) );

		expect( useVisitsQuery ).toHaveBeenCalledWith( 1, 'week', 13, '2026-10-07', '2026-10-01' );
	} );

	it( 'draws a week that starts before the range from its first day', async () => {
		// Monday September 28 starts the week the range's first day, a Thursday, falls in.
		const weeks = [
			{ period: '2026-09-28', views: 20, visitors: 8 },
			{ period: '2026-10-05', views: 10, visitors: 4 },
		];
		render( renderMiniChart( success( weeks ), DATE_RANGE_LAST_90_DAYS ) );
		expect( await screen.findByText( 'Chart' ) ).toBeInTheDocument();

		const dates = mockChartProps.series[ 0 ].data.map( ( point ) => point.date );
		expect( dates ).toEqual( [ new Date( 2026, 9, 1 ), new Date( 2026, 9, 5 ) ] );
		expect( mockChartProps.range ).toEqual(
			expect.objectContaining( { unit: 'week', startDate: '2026-10-01', endDate: '2026-10-07' } )
		);
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

	it( 'shows skeletons for the totals and the chart while the range loads', () => {
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
