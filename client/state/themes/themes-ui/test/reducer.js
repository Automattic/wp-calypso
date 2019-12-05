/**
 * Internal dependencies
 */
import reducer, {
	backPath,
	themesBannerVisible,
	themesShowcaseOpen,
	themesBookmark,
} from '../reducer';
import {
	SERIALIZE,
	DESERIALIZE,
	THEMES_SHOWCASE_OPEN,
	THEMES_BOOKMARK_SET,
} from 'state/action-types';

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [ 'backPath', 'themesBannerVisible' ] )
		);
	} );
} );

describe( '#backPath', () => {
	const state = backPath( undefined, {} );

	test( 'should default to a backPath of /themes', () => {
		expect( state ).toBe( '/themes' );
	} );
} );

describe( '#themesBannerVisible', () => {
	test( 'should default to a themesBannerVisible of true', () => {
		const state = themesBannerVisible( undefined, {} );

		expect( state ).toBe( true );
	} );

	test( 'persists visible state', () => {
		const state = themesBannerVisible( true, {
			type: SERIALIZE,
		} );

		expect( state ).toBe( true );
	} );

	test( 'persists invisible state', () => {
		const state = themesBannerVisible( false, {
			type: SERIALIZE,
		} );

		expect( state ).toBe( false );
	} );

	test( 'loads persisted visible state', () => {
		const state = themesBannerVisible( true, {
			type: DESERIALIZE,
		} );

		expect( state ).toBe( true );
	} );

	test( 'loads persisted invisible state', () => {
		const state = themesBannerVisible( false, {
			type: DESERIALIZE,
		} );

		expect( state ).toBe( false );
	} );

	test( "doesn't load invalid persisted state", () => {
		jest.spyOn( console, 'warn' ).mockImplementation( () => {} );
		const state = themesBannerVisible( 'wtf', {
			type: DESERIALIZE,
		} );

		expect( state ).toBe( true ); // Falls back to `initialState`, which is `true`.
	} );
} );

describe( '#themesShowcaseOpen', () => {
	test( 'initializes to false', () => {
		const state = themesShowcaseOpen( undefined, {} );
		expect( state ).toBe( false );
	} );

	test( 'action type THEMES_SHOWCASE_OPEN sets value to true', () => {
		const state = themesShowcaseOpen( false, { type: THEMES_SHOWCASE_OPEN } );
		expect( state ).toBe( true );
	} );

	test( 'fubar action does not alter state', () => {
		const state = themesShowcaseOpen( false, { type: 'FUBAR_ACTION' } );
		expect( state ).toBe( false );
	} );
} );

describe( '#themesBookmark', () => {
	test( 'initializes search, filter, and id as empty strings', () => {
		const state = themesBookmark( undefined, {} );
		expect( state ).toEqual( {
			search: '',
			filter: '',
			id: '',
		} );
	} );

	test( 'adds and overrites given values on THEMES_BOOKMARK_SET', () => {
		const state = themesBookmark( undefined, {
			type: THEMES_BOOKMARK_SET,
			payload: { id: 'fubarId', fubarKey: 'fubarValue' },
		} );
		expect( state ).toEqual( {
			search: '',
			filter: '',
			id: 'fubarId',
			fubarKey: 'fubarValue',
		} );
	} );

	test( 'fubar action does not alter state', () => {
		const state = themesBookmark( undefined, {
			type: 'FUBAR_ACTION',
			payload: { id: 'fubarId', fubarKey: 'fubarValue ' },
		} );
		expect( state ).toEqual( {
			search: '',
			filter: '',
			id: '',
		} );
	} );
} );
