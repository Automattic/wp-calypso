/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { geocode, reverseGeocode } from '../';
import { useNock } from 'test/helpers/use-nock';

/**
 * Module variables
 */
const TEST_ADDRESS = '1600 Amphitheatre Parkway, Mountain View, CA';

const TEST_LATITUDE = '41.878114';

const TEST_LONGITUDE = '-87.629798';

describe( 'geocoding', () => {
	describe( 'when converting a search string to location results', () => {
		useNock( nock => {
			nock( 'https://maps.googleapis.com' )
				.persist()
				.get( '/maps/api/geocode/json' )
				.query( { address: TEST_ADDRESS } )
				.reply( 200, { results: [ 1, 2, 3 ], status: 'OK' } );
		} );

		describe( '#geocode()', () => {
			test( 'should return a promise', () => {
				expect( geocode( TEST_ADDRESS ) ).to.be.an.instanceof( Promise );
			} );

			test( 'should call to the Google Maps API', done => {
				geocode( TEST_ADDRESS )
					.then( results => {
						expect( results ).to.eql( [ 1, 2, 3 ] );
						done();
					} )
					.catch( done );
			} );
		} );
	} );

	describe( 'when converting from coordinates to address labels', () => {
		useNock( nock => {
			nock( 'https://maps.googleapis.com', { encodedQueryParams: true } )
				.persist()
				.get( '/maps/api/geocode/json' )
				.query( { latlng: TEST_LATITUDE + '%2C' + TEST_LONGITUDE } )
				.reply( 200, { results: [ 1, 2, 3 ], status: 'OK' } );
		} );

		describe( '#reverseGeocode()', () => {
			test( 'should return a promise', () => {
				expect( reverseGeocode( TEST_LATITUDE, TEST_LONGITUDE ) ).to.be.an.instanceof( Promise );
			} );

			test( 'should call to the Google Maps API', done => {
				reverseGeocode( TEST_LATITUDE, TEST_LONGITUDE )
					.then( results => {
						expect( results ).to.eql( [ 1, 2, 3 ] );
						done();
					} )
					.catch( done );
			} );
		} );
	} );
} );
