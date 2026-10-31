/**
 * @jest-environment jsdom
 */
import readStatsChartType from '../chart-type';

describe( 'readStatsChartType', () => {
	afterEach( () => {
		localStorage.clear();
		jest.restoreAllMocks();
	} );

	it.each( [
		[ 'line', 'line' ],
		[ 'bar', 'bar' ],
	] )( 'follows the %s chart the viewer chose on the Stats page', ( stored, expected ) => {
		localStorage.setItem( 'jetpack_stats_chart_type_7', stored );
		expect( readStatsChartType( 7 ) ).toBe( expected );
	} );

	it( "defaults to bars, the Stats page's own default", () => {
		expect( readStatsChartType( 7 ) ).toBe( 'bar' );
	} );

	it( 'reads the choice for this site, not another', () => {
		localStorage.setItem( 'jetpack_stats_chart_type_8', 'line' );
		expect( readStatsChartType( 7 ) ).toBe( 'bar' );
	} );

	it( 'ignores a value the Stats page never writes', () => {
		localStorage.setItem( 'jetpack_stats_chart_type_7', 'pie' );
		expect( readStatsChartType( 7 ) ).toBe( 'bar' );
	} );

	it( 'falls back to bars where site data is blocked', () => {
		jest.spyOn( Storage.prototype, 'getItem' ).mockImplementation( () => {
			throw new DOMException( 'blocked', 'SecurityError' );
		} );
		expect( readStatsChartType( 7 ) ).toBe( 'bar' );
	} );
} );
