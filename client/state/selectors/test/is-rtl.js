/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isRtl } from 'state/selectors';

describe( 'isRtl()', () => {
	test( 'should return null if the value is not known', () => {
		const result = isRtl( { ui: { language: {} } } );

		expect( result ).to.be.null;
	} );

	test( 'should return true if the localeSlug is RTL language', () => {
		const result = isRtl( {
			ui: {
				language: {
					localeSlug: 'he',
				},
			},
		} );

		expect( result ).to.be.true;
	} );

	test( 'should return true if the localeSlug is LTR language', () => {
		const result = isRtl( {
			ui: {
				language: {
					localeSlug: 'fr',
				},
			},
		} );

		expect( result ).to.be.false;
	} );
} );
