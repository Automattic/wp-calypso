/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { canCurrentUser } from '../';

describe( 'canCurrentUser()', () => {
	it( 'should return null if the site is not known', () => {
		const isCapable = canCurrentUser( {
			currentUser: {
				capabilities: {}
			}
		}, 2916284, 'manage_options' );

		expect( isCapable ).to.be.null;
	} );

	it( 'should return the value for the specified capability', () => {
		const isCapable = canCurrentUser( {
			currentUser: {
				capabilities: {
					2916284: {
						manage_options: false
					}
				}
			}
		}, 2916284, 'manage_options' );

		expect( isCapable ).to.be.false;
	} );

	it( 'should return null if the capability is invalid', () => {
		const isCapable = canCurrentUser( {
			currentUser: {
				capabilities: {
					2916284: {
						manage_options: false
					}
				}
			}
		}, 2916284, 'manage_foo' );

		expect( isCapable ).to.be.null;
	} );
} );
