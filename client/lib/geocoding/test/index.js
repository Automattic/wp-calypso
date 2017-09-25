/**
 * External dependencies
 */
import { expect } from 'chai';
import nock from 'nock';

/**
 * Internal dependencies
 */
import { geocode } from '../';
import { useNock } from 'test/helpers/use-nock';

/**
 * Module variables
 */
const TEST_ADDRESS = '1600 Amphitheatre Parkway, Mountain View, CA';

describe( 'geocoding', () => {
	useNock();

	before( () => {
		nock( 'https://maps.googleapis.com' )
			.persist()
			.get( '/maps/api/geocode/json' )
			.query( { address: TEST_ADDRESS } )
			.reply( 200, { results: [ 1, 2, 3 ], status: 'OK' } );
	} );

	describe( '#geocode()', () => {
		it( 'should return a promise', () => {
			expect( geocode( TEST_ADDRESS ) ).to.be.an.instanceof( Promise );
		} );

		it( 'should call to the Google Maps API', ( done ) => {
			geocode( TEST_ADDRESS ).then( ( results ) => {
				expect( results ).to.eql( [ 1, 2, 3 ] );
				done();
			} ).catch( done );
		} );
	} );
} );
