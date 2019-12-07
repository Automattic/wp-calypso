/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isRtl from 'state/selectors/is-rtl';

describe( 'isRtl()', () => {
	test( 'should return null if the value is not known', () => {
		const result = isRtl( { ui: { language: {} } } );

		expect( result ).to.be.null;
	} );

	test( 'should return false if the isRtl reducer is false', () => {
		const result = isRtl( {
			ui: {
				language: {
					isRtl: false,
				},
			},
		} );

		expect( result ).to.be.false;
	} );

	test( 'should return true if the isRtl reducer is true', () => {
		const result = isRtl( {
			ui: {
				language: {
					isRtl: true,
				},
			},
		} );

		expect( result ).to.be.true;
	} );
} );
