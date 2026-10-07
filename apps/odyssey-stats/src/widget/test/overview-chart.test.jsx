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

	it.each( [
		[ 'day', 'Sep 20' ],
		[ 'month', 'Sep' ],
	] )( 'labels a %s point as %s', ( unit, expected ) => {
		const { x } = renderAxes( unit );
		expect( x.tickFormat( new Date( 2026, 8, 20 ).getTime() ) ).toBe( expected );
	} );

	it.each( [
		[ 0, '' ],
		[ 0.5, '' ],
		[ 2.5, '' ],
		[ 3, '3' ],
		[ 1200, '1.2K' ],
	] )( 'labels the value %s as "%s"', ( value, expected ) => {
		const { y } = renderAxes();
		expect( y.tickFormat( value ) ).toBe( expected );
	} );
} );

describe( 'OverviewChart tooltip', () => {
	beforeEach( () => {
		LineChart.mockClear();
	} );

	it.each( [
		[ 'month', 'July 2026' ],
		[ 'day', 'Jul 1, 2026' ],
	] )( 'names the %s a total covers', ( unit, expected ) => {
		renderTooltip( unit, { Views: 1200 } );
		expect( screen.getByText( expected ) ).toBeInTheDocument();
	} );

	it( 'lists every series in full, largest first', () => {
		const { container } = renderTooltip( 'day', { Visitors: 620, Views: 1204 } );

		expect( screen.getByText( '1,204' ) ).toBeInTheDocument();
		expect( screen.getByText( '620' ) ).toBeInTheDocument();
		expect( container.textContent ).toMatch( /Views.*Visitors/ );
	} );
} );
