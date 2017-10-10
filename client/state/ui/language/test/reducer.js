/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { localeSlug } from '../reducer';
import { LOCALE_SET } from 'state/action-types';

describe( 'reducer', () => {
	describe( 'localeSlug', () => {
		test( 'returns an appropriate localeSlug', () => {
			const state = 'en';
			const action = { type: LOCALE_SET, localeSlug: 'he' };
			expect( localeSlug( state, action ) ).to.eql( 'he' );
		} );
	} );
} );
