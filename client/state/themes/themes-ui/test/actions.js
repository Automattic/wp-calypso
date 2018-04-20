/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { hideThemesBanner } from '../actions';
import { THEMES_BANNER_HIDE } from 'state/action-types';

describe( 'actions', () => {
	describe( 'hideThemesBanner()', () => {
		test( 'Should return the expected action object', () => {
			const action = hideThemesBanner();
			expect( action ).to.eql( {
				type: THEMES_BANNER_HIDE,
			} );
		} );
	} );
} );
