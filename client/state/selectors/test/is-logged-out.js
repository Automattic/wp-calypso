/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isLoggedOut } from '../';

describe( 'isLoggedOut()', () => {
	it( 'should return false if user exists', () => {
		const result = isLoggedOut( {
			currentUser: {
				id: 73705554
			}
		} );

		expect( result ).to.be.false;
	} );

	it( 'should return true if user does not exist', () => {
		const result = isLoggedOut( {
			currentUser: {
				id: null
			}
		} );

		expect( result ).to.be.true;
	} );
} );
