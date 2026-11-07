/**
 * @jest-environment jsdom
 */
import { BarChart, LineChart } from '@automattic/charts';
import { act, fireEvent, render, screen } from '@testing-library/react';
import moment from 'moment';
import 'moment/locale/de';
import 'moment/locale/th';
import OverviewChart from '../overview-chart';

// Loading a locale also switches to it.
moment.locale( 'en' );

// The chart's emitter and tooltip, from the providers a clickable chart renders under.
let mockChartEmit = null;
let mockChartTooltip = null;

jest.mock( '@automattic/charts', () => {
	const { useContext } = require( 'react' );
	const { TooltipContext, useEventEmitter } = require( '@visx/xychart' );
	const Chart = () => {
		mockChartEmit = useEventEmitter();
		mockChartTooltip = useContext( TooltipContext );
		return null;
	};
	return { BarChart: jest.fn( Chart ), LineChart: jest.fn( Chart ) };
} );

const series = [ { label: 'Views', data: [] } ];

const renderChart = (
	unit = 'day',
	chartType = 'line',
	data = series,
	endDate = '2026-07-31',
	onBucketClick = undefined
) => {
	const range = { unit, startDate: '2026-06-01', endDate };
	render(
		<OverviewChart
			series={ data }
			height={ 160 }
			range={ range }
			chartType={ chartType }
			onBucketClick={ onBucketClick }
		/>
	);
	return ( 'bar' === chartType ? BarChart : LineChart ).mock.calls[ 0 ][ 0 ];
};

const renderAxes = ( unit = 'day' ) => renderChart( unit ).options.axis;

const HOVERED = new Date( 2026, 6, 1 );
const EARLIER = new Date( 2026, 5, 1 );

/**
 * Renders the chart's tooltip for a hovered point.
 * @param {string} unit      The range's bucket.
 * @param {Object} values    Each series' value at the hovered date, keyed by its label.
 * @param {string} chartType Bars or lines.
 */
const renderTooltip = ( unit, values, chartType = 'line' ) => {
	const data = Object.entries( values ).map( ( [ label, value ] ) => ( {
		label,
		data: [
			{ date: EARLIER, value: value * 10 },
			{ date: HOVERED, value },
		],
	} ) );
	const tooltip = renderChart( unit, chartType, data ).renderTooltip( {
		tooltipData: {
			nearestDatum: { datum: { date: HOVERED } },
			// What each series last reported; on bars this lags for every series but the focused one.
			datumByKey: Object.fromEntries(
				data.map( ( { label, data: points } ) => [ label, { datum: points[ 0 ] } ] )
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

		expect( props.data ).toEqual( series );
		expect( props.height ).toBe( 160 );
		expect( other ).not.toHaveBeenCalled();
		expect( drawn ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'draws the visitors bar inside the views bar', () => {
		const views = { label: 'Views', data: [], options: { stroke: '#00f' } };
		const visitors = { label: 'Visitors', data: [], options: { stroke: '#0f0' } };
		const { data } = renderChart( 'day', 'bar', [ views, visitors ] );

		expect( data ).toEqual( [
			{ ...views, group: 'traffic', options: { stroke: '#00f', type: 'comparison' } },
			{ ...visitors, group: 'traffic' },
		] );
	} );

	it( 'draws the lines as they are, one over the other', () => {
		const views = { label: 'Views', data: [] };
		const visitors = { label: 'Visitors', data: [] };
		const { data } = renderChart( 'day', 'line', [ views, visitors ] );

		expect( data ).toEqual( [ views, visitors ] );
	} );

	it( 'gives both charts the same scale, axis labels and margin', () => {
		const line = renderChart( 'day', 'line' );
		const bar = renderChart( 'day', 'bar' );

		expect( bar.options.yScale ).toEqual( line.options.yScale );
		expect( bar.options.axis.y.tickFormat( 1200 ) ).toBe( line.options.axis.y.tickFormat( 1200 ) );
		expect( bar.margin ).toEqual( line.margin );
	} );

	it.each( [ 'line', 'bar' ] )(
		'draws a week that starts before the range from its first day, as a %s chart',
		( chartType ) => {
			// Monday June 29 starts the week the range's first day, a Wednesday, falls in.
			const data = [ { label: 'Views', data: [ { date: new Date( 2026, 5, 29 ), value: 3 } ] } ];
			const range = { unit: 'week', startDate: '2026-07-01', endDate: '2026-07-31' };
			render(
				<OverviewChart series={ data } height={ 160 } range={ range } chartType={ chartType } />
			);
			const props = ( 'bar' === chartType ? BarChart : LineChart ).mock.calls[ 0 ][ 0 ];

			expect( props.data[ 0 ].data ).toEqual( [ { date: HOVERED, value: 3 } ] );
		}
	);
} );

describe( 'OverviewChart click', () => {
	const CLICKED = new Date( 2026, 6, 1 );
	const point = { date: CLICKED, value: 3 };

	// The line chart reports its own presses and releases, with the point under them.
	const pressLine = ( props, x = 10, y = 10, event = { button: 0 } ) =>
		props.onPointerDown( { svgPoint: { x, y }, event } );
	const releaseLine = ( props, x = 10, y = 10, datum = point ) =>
		props.onPointerUp( { datum, svgPoint: { x, y }, event: { button: 0 } } );

	// The bar chart's come through its emitter, as events on an element, and its tooltip
	// names the bar under the pointer.
	const pointerEvent = ( type, x, y, init = {} ) => {
		const event = new MouseEvent( type, { clientX: x, clientY: y, button: 0, ...init } );
		document.createElement( 'div' ).dispatchEvent( event );
		return event;
	};
	// What the keyboard moved to, as the chart reports it: the tooltip follows the focus.
	const hoverBar = ( datum = point ) =>
		act( () =>
			mockChartTooltip.showTooltip( {
				key: 'Views',
				index: 0,
				datum,
				distanceX: 1,
				distanceY: 1,
			} )
		);
	const pressBar = ( x = 10, y = 10, init = {} ) =>
		act( () => mockChartEmit( 'pointerdown', pointerEvent( 'pointerdown', x, y, init ) ) );
	const releaseBar = ( x = 10, y = 10 ) =>
		act( () => mockChartEmit( 'pointerup', pointerEvent( 'pointerup', x, y ) ) );
	const pressEnter = ( container ) => fireEvent.keyDown( container.firstChild, { key: 'Enter' } );

	beforeEach( () => {
		BarChart.mockClear();
		LineChart.mockClear();
		mockChartEmit = null;
		mockChartTooltip = null;
	} );

	it( 'reports the point a line chart was clicked on', () => {
		const onBucketClick = jest.fn();
		const props = renderChart( 'day', 'line', series, '2026-07-31', onBucketClick );

		pressLine( props );
		releaseLine( props );

		expect( onBucketClick ).toHaveBeenCalledTimes( 1 );
		expect( onBucketClick ).toHaveBeenCalledWith( CLICKED );
	} );

	it( 'reads a drag across a line chart as no click', () => {
		const onBucketClick = jest.fn();
		const props = renderChart( 'day', 'line', series, '2026-07-31', onBucketClick );

		pressLine( props, 10, 10 );
		releaseLine( props, 30, 10 );

		expect( onBucketClick ).not.toHaveBeenCalled();
	} );

	it( 'ignores a release on a line chart whose press began off the chart', () => {
		const onBucketClick = jest.fn();
		const props = renderChart( 'day', 'line', series, '2026-07-31', onBucketClick );

		releaseLine( props );

		expect( onBucketClick ).not.toHaveBeenCalled();
	} );

	it( 'ignores a click on a line chart that lands on no point', () => {
		const onBucketClick = jest.fn();
		const props = renderChart( 'day', 'line', series, '2026-07-31', onBucketClick );

		pressLine( props );
		releaseLine( props, 10, 10, null );

		expect( onBucketClick ).not.toHaveBeenCalled();
	} );

	// A press that asks for a new tab or a menu, as a link would give; the chart cannot.
	it.each( [
		[ 'Cmd-click', { button: 0, metaKey: true } ],
		[ 'Ctrl-click', { button: 0, ctrlKey: true } ],
		[ 'Shift-click', { button: 0, shiftKey: true } ],
		[ 'a middle click', { button: 1 } ],
		[ 'a right click', { button: 2 } ],
		[ 'a press with no event', null ],
	] )( 'leaves %s on a line chart alone', ( _, event ) => {
		const onBucketClick = jest.fn();
		const props = renderChart( 'day', 'line', series, '2026-07-31', onBucketClick );

		pressLine( props, 10, 10, event );
		releaseLine( props );

		expect( onBucketClick ).not.toHaveBeenCalled();
	} );

	it.each( [
		[ 'Cmd-click', { metaKey: true } ],
		[ 'a middle click', { button: 1 } ],
		[ 'a right click', { button: 2 } ],
	] )( 'leaves %s on a bar chart alone', ( _, init ) => {
		const onBucketClick = jest.fn();
		renderChart( 'day', 'bar', series, '2026-07-31', onBucketClick );

		hoverBar();
		pressBar( 10, 10, init );
		releaseBar();

		expect( onBucketClick ).not.toHaveBeenCalled();
	} );

	it.each( [ 'bar', 'line' ] )(
		'opens the point the keyboard moved to on Enter, on a %s chart',
		( chartType ) => {
			const onBucketClick = jest.fn();
			const { container } = render(
				<OverviewChart
					series={ series }
					height={ 160 }
					range={ { unit: 'day', startDate: '2026-06-01', endDate: '2026-07-31' } }
					chartType={ chartType }
					onBucketClick={ onBucketClick }
				/>
			);

			pressEnter( container );
			expect( onBucketClick ).not.toHaveBeenCalled();

			hoverBar();
			fireEvent.keyDown( container.firstChild, { key: ' ' } );
			expect( onBucketClick ).not.toHaveBeenCalled();

			pressEnter( container );
			expect( onBucketClick ).toHaveBeenCalledTimes( 1 );
			expect( onBucketClick ).toHaveBeenCalledWith( CLICKED );
		}
	);

	it( 'reports the bar its tooltip names when a bar chart is clicked', () => {
		const onBucketClick = jest.fn();
		renderChart( 'day', 'bar', series, '2026-07-31', onBucketClick );

		hoverBar();
		pressBar();
		releaseBar();

		expect( onBucketClick ).toHaveBeenCalledTimes( 1 );
		expect( onBucketClick ).toHaveBeenCalledWith( CLICKED );
	} );

	it( 'reads the bar at the release, not the one hovered when the chart was drawn', () => {
		const onBucketClick = jest.fn();
		const later = new Date( 2026, 6, 2 );
		renderChart( 'day', 'bar', series, '2026-07-31', onBucketClick );

		hoverBar();
		hoverBar( { date: later, value: 5 } );
		pressBar();
		releaseBar();

		expect( onBucketClick ).toHaveBeenCalledWith( later );
	} );

	it( 'reads a drag across a bar chart as no click', () => {
		const onBucketClick = jest.fn();
		renderChart( 'day', 'bar', series, '2026-07-31', onBucketClick );

		hoverBar();
		pressBar( 10, 10 );
		releaseBar( 30, 10 );

		expect( onBucketClick ).not.toHaveBeenCalled();
	} );

	it( 'ignores a click on a bar chart with no bar under the tooltip', () => {
		const onBucketClick = jest.fn();
		renderChart( 'day', 'bar', series, '2026-07-31', onBucketClick );

		pressBar();
		releaseBar();

		expect( onBucketClick ).not.toHaveBeenCalled();
	} );

	it( 'listens for nothing without a click to report to', () => {
		const line = renderChart( 'day', 'line' );
		expect( line.onPointerDown ).toBeUndefined();
		expect( line.onPointerUp ).toBeUndefined();

		// No providers around the chart either, so it keeps its own emitter and tooltip.
		renderChart( 'day', 'bar' );
		expect( mockChartEmit ).toBeNull();
		expect( mockChartTooltip ).toBeFalsy();
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
		[ 'week', 'Sep 20' ],
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

	it.each( [
		// Wednesday July 1 starts a week the range begins in; the week runs to its Sunday.
		[ 'to its Sunday', '2026-07-31', /^July 1\s*–\s*5, 2026$/ ],
		[ "to the range's last day", '2026-07-02', /^July 1\s*–\s*2, 2026$/ ],
	] )( 'names the days of a week %s', ( _, endDate, expected ) => {
		const data = [ { label: 'Views', data: [ { date: HOVERED, value: 3 } ] } ];
		const tooltip = renderChart( 'week', 'line', data, endDate ).renderTooltip( {
			tooltipData: { nearestDatum: { datum: { date: HOVERED } } },
		} );
		render( <div>{ tooltip }</div> );

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

	it( 'reads each series at the hovered date, not where its focus last was', () => {
		renderTooltip( 'month', { Views: 12, Visitors: 1 }, 'bar' );

		expect( screen.getByText( '12' ) ).toBeInTheDocument();
		expect( screen.getByText( '1' ) ).toBeInTheDocument();
		expect( screen.queryByText( '10' ) ).not.toBeInTheDocument();
	} );

	it( 'shows a series without a point at the hovered date as zero', () => {
		const tooltip = renderChart( 'day', 'bar', [
			{ label: 'Views', data: [ { date: HOVERED, value: 3 } ] },
			{ label: 'Visitors', data: [ { date: EARLIER, value: 2 } ] },
		] ).renderTooltip( { tooltipData: { nearestDatum: { datum: { date: HOVERED } } } } );
		render( <div>{ tooltip }</div> );

		expect( screen.getByText( '3' ) ).toBeInTheDocument();
		expect( screen.getByText( '0' ) ).toBeInTheDocument();
	} );

	it( "names and reads a week moved to the range's first day from that day", () => {
		const data = [ { label: 'Views', data: [ { date: new Date( 2026, 5, 29 ), value: 3 } ] } ];
		const range = { unit: 'week', startDate: '2026-07-01', endDate: '2026-07-31' };
		render( <OverviewChart series={ data } height={ 160 } range={ range } chartType="line" /> );
		const tooltip = LineChart.mock.calls[ 0 ][ 0 ].renderTooltip( {
			tooltipData: { nearestDatum: { datum: { date: HOVERED } } },
		} );
		render( <div>{ tooltip }</div> );

		expect( screen.getByText( /^July 1\s*–\s*5, 2026$/ ) ).toBeInTheDocument();
		expect( screen.getByText( '3' ) ).toBeInTheDocument();
	} );
} );
