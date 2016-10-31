/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isStale } from '../utils';

describe( 'utils', () => {
	describe( '#isStale()', () => {
		it( 'should return false if the passed timestamp is null', () => {
			expect( isStale( null ) ).to.be.false;
		} );

		it( 'should return false if the passed timestamp is undefined', () => {
			expect( isStale( undefined ) ).to.be.false;
		} );

		it( 'should return false if the passed timestamp is not stale', () => {
			expect( isStale( new Date().getTime() - 60 ) ).to.be.false;
		} );

		it( 'should return false if the passed timestamp is a millisecond away from being stale', () => {
			expect( isStale( new Date().getTime() ) ).to.be.false;
		} );

		it( 'should return true if the passed timestamp is stale', () => {
			expect( isStale( 1 ) ).to.be.true;
		} );

		it( 'should return false if the timestamp is not stale with a specific expiration', () => {
			expect( isStale( new Date().getTime(), 60 ) ).to.be.false;
		} );

		it( 'should return true if the timestamp is stale with a specific expiration', () => {
			expect( isStale( new Date().getTime() - 61, 60 ) ).to.be.true;
		} );
	} );
} );
