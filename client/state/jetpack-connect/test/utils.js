/**
 * Internal dependencies
 */
import { isStale } from '../utils';

describe( 'utils', () => {
	describe( '#isStale()', () => {
		test( 'should return false if the passed timestamp is null', () => {
			expect( isStale( null ) ).toBe( false );
		} );

		test( 'should return false if the passed timestamp is undefined', () => {
			expect( isStale( undefined ) ).toBe( false );
		} );

		test( 'should return false if the passed timestamp is not stale', () => {
			expect( isStale( new Date().getTime() - 60 ) ).toBe( false );
		} );

		test( 'should return false if the passed timestamp is a millisecond away from being stale', () => {
			expect( isStale( new Date().getTime() ) ).toBe( false );
		} );

		test( 'should return true if the passed timestamp is stale', () => {
			expect( isStale( 1 ) ).toBe( true );
		} );

		test( 'should return false if the timestamp is not stale with a specific expiration', () => {
			expect( isStale( new Date().getTime(), 60 ) ).toBe( false );
		} );

		test( 'should return true if the timestamp is stale with a specific expiration', () => {
			expect( isStale( new Date().getTime() - 61, 60 ) ).toBe( true );
		} );
	} );
} );
