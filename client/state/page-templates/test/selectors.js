/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isRequestingPageTemplates, getPageTemplates } from '../selectors';

describe( 'selectors', () => {
	describe( 'isRequestingPageTemplates()', () => {
		it( 'should return false if the site is not tracked', () => {
			const isRequesting = isRequestingPageTemplates( {
				pageTemplates: {
					requesting: {}
				}
			}, 2916284 );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if a request is in progress for the site', () => {
			const isRequesting = isRequestingPageTemplates( {
				pageTemplates: {
					requesting: {
						2916284: true
					}
				}
			}, 2916284 );

			expect( isRequesting ).to.be.true;
		} );

		it( 'should return false if a request has completed for the site', () => {
			const isRequesting = isRequestingPageTemplates( {
				pageTemplates: {
					requesting: {
						2916284: false
					}
				}
			}, 2916284 );

			expect( isRequesting ).to.be.false;
		} );
	} );
} );
