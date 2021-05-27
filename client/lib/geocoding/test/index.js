/**
 * External dependencies
 */
import { geocode, reverseGeocode } from '../';

jest.mock( '@automattic/load-script', () => require( './mocks/load-script' ).default );
/**
 * Module variables
 */
const TEST_ADDRESS = '1600 Amphitheatre Parkway, Mountain View, CA';

const TEST_LATITUDE = '41.878114';

const TEST_LONGITUDE = '-87.629798';

describe( 'geocoding', () => {
	describe( 'when converting a search string to location results', () => {
		describe( '#geocode()', () => {
			test( 'should return a promise', () => {
				expect( geocode( TEST_ADDRESS ) ).toBeInstanceOf( Promise );
			} );

			test( 'should call to the Google Maps API', async () => {
				await expect( geocode( TEST_ADDRESS ) ).resolves.toEqual( [ 1, 2, 3 ] );
			} );
		} );
	} );

	describe( 'when converting from coordinates to address labels', () => {
		describe( '#reverseGeocode()', () => {
			test( 'should return a promise', () => {
				expect( reverseGeocode( TEST_LATITUDE, TEST_LONGITUDE ) ).toBeInstanceOf( Promise );
			} );

			test( 'should call to the Google Maps API', async () => {
				await expect( reverseGeocode( TEST_LATITUDE, TEST_LONGITUDE ) ).resolves.toEqual( [
					1,
					2,
					3,
				] );
			} );
		} );
	} );
} );
