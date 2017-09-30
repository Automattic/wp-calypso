/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isRtl } from '../';

describe( 'isRtl()', () => {
	it( 'should return null if the value is not known', () => {
		const result = isRtl( {	} );

		expect( result ).to.be.null;
	} );

	it( 'should return true if the localeSlug is RTL language', () => {
		const result = isRtl( {
			ui: {
				language: {
					localeSlug: 'he'
				}
			}
		} );

		expect( result ).to.be.true;
	} );

	it( 'should return true if the localeSlug is LTR language', () => {
		const result = isRtl( {
			ui: {
				language: {
					localeSlug: 'fr'
				}
			}
		} );

		expect( result ).to.be.false;
	} );
} );
