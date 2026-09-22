/**
 * @jest-environment jsdom
 */
import { LineChart } from '@automattic/charts';
import { render } from '@testing-library/react';
import OverviewChart from '../overview-chart';

jest.mock( '@automattic/charts', () => ( {
	LineChart: jest.fn( () => null ),
} ) );

const renderAxes = ( unit = 'day' ) => {
	render( <OverviewChart series={ [] } height={ 160 } unit={ unit } /> );
	return LineChart.mock.calls[ 0 ][ 0 ].options.axis;
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

	it( 'gives the x axis the class the edge-label rule targets', () => {
		const { x } = renderAxes();
		expect( x.axisClassName ).toBe( 'stats-widget-chart__x-axis' );
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
