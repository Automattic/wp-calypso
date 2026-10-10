/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import useVisitsQuery from '../../hooks/use-visits-query';
import {
	getDateRange,
	DATE_RANGE_LAST_7_DAYS,
	DATE_RANGE_LAST_90_DAYS,
} from '../../lib/date-ranges';
import MiniChart from '../mini-chart';

let mockChartFails = false;

jest.mock( '../../hooks/use-visits-query' );
jest.mock( 'calypso/my-sites/stats/hooks/use-css-variable', () => () => '#3858e9' );
jest.mock( '../overview-chart', () => ( {
	__esModule: true,
	default: () => {
		if ( mockChartFails ) {
			throw new Error( 'Loading chunk 9542 failed' );
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
	return <MiniChart siteId={ 1 } range={ range } />;
}

describe( 'MiniChart', () => {
	beforeEach( () => {
		mockChartFails = false;
		// Reduced motion lands the totals on their value without counting up.
		window.matchMedia = jest.fn().mockReturnValue( { matches: true } );
		jest.spyOn( console, 'error' ).mockImplementation( () => {} );
	} );

	afterEach( () => {
		// eslint-disable-next-line no-console
		console.error.mockRestore();
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
