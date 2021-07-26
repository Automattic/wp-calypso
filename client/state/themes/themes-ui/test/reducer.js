/**
 * Internal dependencies
 */
import reducer, { backPath, themesBookmark } from '../reducer';
import { THEMES_BOOKMARK_SET } from 'calypso/state/themes/action-types';

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [ 'backPath' ] )
		);
	} );
} );

describe( '#backPath', () => {
	const state = backPath( undefined, {} );

	test( 'should default to a backPath of /themes', () => {
		expect( state ).toBe( '/themes' );
	} );
} );

describe( '#themesBookmark', () => {
	test( 'initializes state as empty string', () => {
		const state = themesBookmark( undefined, {} );
		expect( state ).toEqual( '' );
	} );

	test( 'sets given value on THEMES_BOOKMARK_SET', () => {
		const state = themesBookmark( undefined, {
			type: THEMES_BOOKMARK_SET,
			payload: 'fubarId',
		} );
		expect( state ).toEqual( 'fubarId' );
	} );

	test( 'fubar action does not alter state', () => {
		const state = themesBookmark( undefined, {
			type: 'FUBAR_ACTION',
			payload: 'fubarId',
		} );
		expect( state ).toEqual( '' );
	} );
} );
