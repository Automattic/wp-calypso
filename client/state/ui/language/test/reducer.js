/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { LOCALE_SET } from 'calypso/state/action-types';

describe( 'reducer', () => {
	test( 'returns default state with undefined state and empty action', () => {
		expect( reducer( undefined, {} ) ).toEqual( { localeSlug: 'en', localeVariant: null } );
	} );

	test( 'returns previous state with empty action', () => {
		const state = { localeSlug: 'de', localeVariant: 'de_formal' };
		expect( reducer( state, {} ) ).toBe( state );
	} );

	test( 'returns new state with valid slug', () => {
		const state = { localeSlug: 'en', localeVariant: 'en' };
		const action = { type: LOCALE_SET, localeSlug: 'de', localeVariant: 'de_formal' };
		expect( reducer( state, action ) ).toEqual( { localeSlug: 'de', localeVariant: 'de_formal' } );
	} );
} );
