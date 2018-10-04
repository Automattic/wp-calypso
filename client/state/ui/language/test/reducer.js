/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { localeSlug, localeVariant, isRtl } from '../reducer';
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

	describe( 'localeVariant', () => {
		test( 'returns default state with undefined state and empty action', () => {
			expect( localeVariant( undefined, {} ) ).to.be.null;
		} );

		test( 'returns previous state with empty action', () => {
			expect( localeVariant( 'de_formal', {} ) ).to.eql( 'de_formal' );
		} );

		test( 'returns default state with undefined state and invalid action type', () => {
			expect( localeVariant( undefined, { type: 'foobar' } ) ).to.be.null;
		} );

		test( 'returns default state of null with undefined state and missing slug', () => {
			expect( localeVariant( undefined, { type: LOCALE_SET } ) ).to.be.null;
		} );

		test( 'returns new state with valid slug', () => {
			const state = 'en';
			const action = { type: LOCALE_SET, localeVariant: 'de_formal' };

			expect( localeVariant( state, action ) ).to.eql( 'de_formal' );
		} );
	} );

	describe( 'isRtl', () => {
		test( 'returns null with undefined state and empty action', () => {
			expect( isRtl( undefined, {} ) ).to.be.null;
		} );

		test( 'returns previous state with empty action', () => {
			expect( isRtl( true, {} ) ).to.be.true;
		} );

		test( 'returns null with undefined state and invalid action type', () => {
			expect( isRtl( undefined, { type: 'foobar' } ) ).to.be.null;
		} );

		test( 'returns true when localeSlug is a RTL language', () => {
			const action = { type: LOCALE_SET, localeSlug: 'ar' };

			expect( isRtl( false, action ) ).to.be.true;
		} );

		test( 'returns false when localeSlug is a LTR language', () => {
			const action = { type: LOCALE_SET, localeSlug: 'fr' };

			expect( isRtl( true, action ) ).to.be.false;
		} );

		test( 'returns null when localeSlug is unknown language', () => {
			const action = { type: LOCALE_SET, localeSlug: 'language' };

			expect( isRtl( undefined, action ) ).to.be.null;
		} );
	} );
} );
