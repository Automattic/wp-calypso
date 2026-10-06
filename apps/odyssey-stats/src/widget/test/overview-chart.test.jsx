/**
 * @jest-environment jsdom
 */
import { LineChart } from '@automattic/charts';
import { render, screen } from '@testing-library/react';
import OverviewChart from '../overview-chart';

jest.mock( '@automattic/charts', () => ( {
	LineChart: jest.fn( () => null ),
} ) );

const renderChart = ( unit = 'day' ) => {
	render( <OverviewChart series={ [] } height={ 160 } unit={ unit } /> );
	return LineChart.mock.calls[ 0 ][ 0 ];
};

const renderAxes = ( unit = 'day' ) => renderChart( unit ).options.axis;

/**
 * Renders the chart's tooltip for a hovered point.
 * @param {string} unit   The range's bucket.
 * @param {Object} datums Each series' value, keyed by its label.
 * @param {Date}   date   The hovered point's date.
 */
const renderTooltip = ( unit, datums, date = new Date( 2026, 6, 1 ) ) => {
	const tooltip = renderChart( unit ).renderTooltip( {
		tooltipData: {
			nearestDatum: { datum: { date } },
			datumByKey: Object.fromEntries(
				Object.entries( datums ).map( ( [ label, value ] ) => [ label, { datum: { value } } ] )
			),
		},
	} );
	return render( <div>{ tooltip }</div> );
};

describe( 'OverviewChart axes', () => {
	beforeEach( () => {
		LineChart.mockClear();
	} );

	it( 'labels dates as a short month and day', () => {
		const { x } = renderAxes();
		expect( x.tickFormat( new Date( 2026, 8, 20 ).getTime() ) ).toBe( 'Sep 20' );
	} );

	it( 'labels monthly points by month alone', () => {
		const { x } = renderAxes( 'month' );
		expect( x.tickFormat( new Date( 2026, 8, 1 ).getTime() ) ).toBe( 'Sep' );
	} );

	it( 'leaves zero unlabelled and formats other values compactly', () => {
		const { y } = renderAxes();
		expect( y.tickFormat( 0 ) ).toBe( '' );
		expect( y.tickFormat( 1200 ) ).toBe( '1.2K' );
	} );

	it( 'leaves fractional values unlabelled, since views are whole', () => {
		const { y } = renderAxes();
		expect( y.tickFormat( 0.5 ) ).toBe( '' );
		expect( y.tickFormat( 2.5 ) ).toBe( '' );
		expect( y.tickFormat( 3 ) ).toBe( '3' );
	} );
} );

describe( 'OverviewChart tooltip', () => {
	beforeEach( () => {
		LineChart.mockClear();
	} );

	it( 'names the month a monthly total covers, rather than its first day', () => {
		renderTooltip( 'month', { Views: 1200 } );
		expect( screen.getByText( 'July 2026' ) ).toBeInTheDocument();
	} );

	it( 'names the day a daily total covers', () => {
		renderTooltip( 'day', { Views: 1200 } );
		expect( screen.getByText( 'Jul 1, 2026' ) ).toBeInTheDocument();
	} );

	it( 'lists every series in full, largest first', () => {
		const { container } = renderTooltip( 'day', { Visitors: 620, Views: 1204 } );

		expect( screen.getByText( '1,204' ) ).toBeInTheDocument();
		expect( screen.getByText( '620' ) ).toBeInTheDocument();
		expect( container.textContent ).toMatch( /Views.*Visitors/ );
	} );

	it( 'renders nothing when no point is hovered', () => {
		const { renderTooltip: render_ } = renderChart( 'day' );
		expect( render_( { tooltipData: {} } ) ).toBeNull();
	} );
} );
