/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isRequestingPostTypes } from '../selectors';

describe( 'selectors', () => {
	describe( '#isRequestingPostTypes()', () => {
		it( 'should return false if the site is not tracked', () => {
			const isRequesting = isRequestingPostTypes( {
				postTypes: {
					requesting: {}
				}
			}, 2916284 );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the site is not fetching', () => {
			const isRequesting = isRequestingPostTypes( {
				postTypes: {
					requesting: {
						2916284: false
					}
				}
			}, 2916284 );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if the site is fetching', () => {
			const isRequesting = isRequestingPostTypes( {
				postTypes: {
					requesting: {
						2916284: true
					}
				}
			}, 2916284 );

			expect( isRequesting ).to.be.true;
		} );
	} );
} );
