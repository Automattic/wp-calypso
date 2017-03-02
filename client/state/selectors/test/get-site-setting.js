/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSiteSetting } from '../';

describe( 'getSiteSettings()', () => {
	const state = {
		siteSettings: {
			items: {
				2916284: { default_category: 'chicken' }
			}
		}
	};

	it( 'should return null if the site is not tracked', () => {
		const settings = getSiteSetting( state, 2916285 );

		expect( settings ).to.be.null;
	} );

	it( 'should return the setting for a siteId', () => {
		const settings = getSiteSetting( state, 2916284, 'default_category' );

		expect( settings ).to.eql( 'chicken' );
	} );
} );
