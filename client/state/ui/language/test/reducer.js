/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { LOCALE_SET } from 'state/action-types';
import { localeSlug } from '../reducer';

describe( 'reducer', () => {
	describe( 'localeSlug', () => {
		it( 'returns an appropriate localeSlug', () => {
			const state = 'en';
			const action = { type: LOCALE_SET, localeSlug: 'he' };
			expect( localeSlug( state, action ) ).to.eql( 'he' );
		} );
	} );
} );
