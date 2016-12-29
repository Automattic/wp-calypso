/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isPrivateSite } from '../';

describe( 'isPrivateSite()', () => {
	it( 'should return null if the site is not known', () => {
		const isPrivate = isPrivateSite( {
			sites: {
				items: {
					2916284: {
						ID: 2916284,
						is_private: false
					}
				}
			}
		}, 2916285 );

		expect( isPrivate ).to.be.null;
	} );

	it( 'should return false for public sites', () => {
		const isPrivate = isPrivateSite( {
			sites: {
				items: {
					2916284: {
						ID: 2916284,
						is_private: false
					}
				}
			}
		}, 2916284 );

		expect( isPrivate ).to.be.false;
	} );

	it( 'should return true for private sites', () => {
		const isPrivate = isPrivateSite( {
			sites: {
				items: {
					2916284: {
						ID: 2916284,
						is_private: true
					}
				}
			}
		}, 2916284 );

		expect( isPrivate ).to.be.true;
	} );
} );
