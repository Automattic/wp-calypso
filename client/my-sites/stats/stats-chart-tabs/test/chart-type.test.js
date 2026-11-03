/**
 * @jest-environment jsdom
 */
import { isMobile } from '@automattic/viewport';
import { readChartType, saveChartType } from '../chart-type';

jest.mock( '@automattic/viewport', () => ( { isMobile: jest.fn( () => false ) } ) );

describe( 'readChartType', () => {
	afterEach( () => {
		localStorage.clear();
		jest.restoreAllMocks();
		isMobile.mockReturnValue( false );
	} );

	it.each( [
		[ 'line', 'line' ],
		[ 'bar', 'bar' ],
	] )( 'follows the %s chart the viewer chose', ( stored, expected ) => {
		localStorage.setItem( 'jetpack_stats_chart_type_7', stored );
		expect( readChartType( 7 ) ).toBe( expected );
	} );

	it( 'defaults to bars', () => {
		expect( readChartType( 7 ) ).toBe( 'bar' );
	} );

	it( 'defaults to lines on a phone', () => {
		expect( readChartType( 7, true ) ).toBe( 'line' );
	} );

	it( 'measures the viewport itself when not told', () => {
		isMobile.mockReturnValue( true );
		expect( readChartType( 7 ) ).toBe( 'line' );
	} );

	it( 'keeps the choice over the phone default', () => {
		localStorage.setItem( 'jetpack_stats_chart_type_7', 'bar' );
		expect( readChartType( 7, true ) ).toBe( 'bar' );
	} );

	it( 'reads the choice for this site, not another', () => {
		localStorage.setItem( 'jetpack_stats_chart_type_8', 'line' );
		expect( readChartType( 7 ) ).toBe( 'bar' );
	} );

	it( 'ignores a value the page never writes', () => {
		localStorage.setItem( 'jetpack_stats_chart_type_7', 'pie' );
		expect( readChartType( 7 ) ).toBe( 'bar' );
	} );

	it( 'draws bars without a site', () => {
		expect( readChartType( null, true ) ).toBe( 'bar' );
	} );

	it( 'falls back to the default where site data is blocked', () => {
		jest.spyOn( Storage.prototype, 'getItem' ).mockImplementation( () => {
			throw new DOMException( 'blocked', 'SecurityError' );
		} );
		expect( readChartType( 7 ) ).toBe( 'bar' );
	} );
} );

describe( 'saveChartType', () => {
	afterEach( () => {
		localStorage.clear();
		jest.restoreAllMocks();
	} );

	it( 'saves the choice for this site', () => {
		saveChartType( 7, 'line' );
		expect( localStorage.getItem( 'jetpack_stats_chart_type_7' ) ).toBe( 'line' );
		expect( readChartType( 7 ) ).toBe( 'line' );
	} );

	it( 'gives up quietly where site data is blocked', () => {
		jest.spyOn( Storage.prototype, 'setItem' ).mockImplementation( () => {
			throw new DOMException( 'blocked', 'SecurityError' );
		} );
		expect( () => saveChartType( 7, 'line' ) ).not.toThrow();
	} );
} );
