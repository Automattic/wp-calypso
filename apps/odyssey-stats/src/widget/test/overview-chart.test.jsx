/**
 * @jest-environment jsdom
 */
import { BarChart, LineChart } from '@automattic/charts';
import { render, screen } from '@testing-library/react';
import moment from 'moment';
import 'moment/locale/de';
import 'moment/locale/th';
import OverviewChart from '../overview-chart';

// Loading a locale also switches to it.
moment.locale( 'en' );

jest.mock( '@automattic/charts', () => ( {
	BarChart: jest.fn( () => null ),
	LineChart: jest.fn( () => null ),
} ) );

const series = [ { label: 'Views', data: [] } ];

const renderChart = ( unit = 'day', chartType = 'line' ) => {
	render(
		<OverviewChart series={ series } height={ 160 } unit={ unit } chartType={ chartType } />
	);
	return ( 'bar' === chartType ? BarChart : LineChart ).mock.calls[ 0 ][ 0 ];
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

describe( 'OverviewChart', () => {
	beforeEach( () => {
		BarChart.mockClear();
		LineChart.mockClear();
	} );

	it.each( [
		[ 'line', LineChart, BarChart ],
		[ 'bar', BarChart, LineChart ],
	] )( 'draws the series as a %s chart', ( chartType, drawn, other ) => {
		const props = renderChart( 'day', chartType );

		expect( props.data ).toBe( series );
		expect( props.height ).toBe( 160 );
		expect( other ).not.toHaveBeenCalled();
		expect( drawn ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'gives both charts the same scale, axis labels and margin', () => {
		const line = renderChart( 'day', 'line' );
		const bar = renderChart( 'day', 'bar' );

		expect( bar.options.yScale ).toEqual( line.options.yScale );
		expect( bar.options.axis.y.tickFormat( 1200 ) ).toBe( line.options.axis.y.tickFormat( 1200 ) );
		expect( bar.margin ).toEqual( line.margin );
	} );
} );

describe( 'OverviewChart axes', () => {
	beforeEach( () => {
		BarChart.mockClear();
		LineChart.mockClear();
	} );

	it( "labels a bar chart's band, a date rather than a timestamp", () => {
		const { x } = renderChart( 'day', 'bar' ).options.axis;
		expect( x.tickFormat( new Date( 2026, 8, 20 ) ) ).toBe( 'Sep 20' );
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
		BarChart.mockClear();
		LineChart.mockClear();
	} );

	it.each( [
		[ 'month', 'July 2026' ],
		[ 'day', 'July 1, 2026' ],
	] )( 'names the %s a total covers', ( unit, expected ) => {
		renderTooltip( unit, { Views: 1200 } );
		expect( screen.getByText( expected ) ).toBeInTheDocument();
	} );

	it( "writes the date in the site locale's order", () => {
		moment.locale( 'de' );
		try {
			renderTooltip( 'day', { Views: 1200 } );
		} finally {
			moment.locale( 'en' );
		}
		expect( screen.getByText( '1. Juli 2026' ) ).toBeInTheDocument();
	} );

	it( 'keeps the Gregorian calendar in a locale whose default is another', () => {
		moment.locale( 'th' );
		try {
			renderTooltip( 'month', { Views: 1200 } );
		} finally {
			moment.locale( 'en' );
		}
		expect( screen.getByText( 'กรกฎาคม 2026' ) ).toBeInTheDocument();
	} );

	it( 'ignores the PHP date format wp-admin writes over the long date format', () => {
		const LL = moment.localeData().longDateFormat( 'LL' );
		moment.updateLocale( 'en', { longDateFormat: { LL: 'F j, Y' } } );
		try {
			renderTooltip( 'day', { Views: 1200 } );
		} finally {
			moment.updateLocale( 'en', { longDateFormat: { LL } } );
		}
		expect( screen.getByText( 'July 1, 2026' ) ).toBeInTheDocument();
	} );

	it( 'lists every series in full, largest first', () => {
		const { container } = renderTooltip( 'day', { Visitors: 620, Views: 1204 } );

		expect( screen.getByText( '1,204' ) ).toBeInTheDocument();
		expect( screen.getByText( '620' ) ).toBeInTheDocument();
		expect( container.textContent ).toMatch( /Views.*Visitors/ );
	} );
} );
