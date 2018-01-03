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
		test( 'returns default state with undefined state and empty action', () => {
			expect( localeSlug( undefined, {} ) ).to.be.null;
		} );

		test( 'returns previous state with empty action', () => {
			expect( localeSlug( 'fr', {} ) ).to.eql( 'fr' );
		} );

		test( 'returns default state with undefined state and invalid action type', () => {
			expect( localeSlug( undefined, { type: 'foobar' } ) ).to.be.null;
		} );

		test( 'returns undefined with undefined state and missing slug', () => {
			expect( localeSlug( undefined, { type: LOCALE_SET } ) ).to.be.undefined;
		} );

		test( 'returns new state with valid slug', () => {
			const state = 'en';
			const action = { type: LOCALE_SET, localeSlug: 'he' };

			expect( localeSlug( state, action ) ).to.eql( 'he' );
		} );
	} );
} );
