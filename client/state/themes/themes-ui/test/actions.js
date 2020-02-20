/**
 * Internal dependencies
 */
import { hideThemesBanner, openThemesShowcase, setThemesBookmark } from '../actions';
import { THEMES_BANNER_HIDE, THEMES_SHOWCASE_OPEN, THEMES_BOOKMARK_SET } from 'state/action-types';

describe( 'actions', () => {
	describe( 'hideThemesBanner()', () => {
		test( 'Should return the expected action object', () => {
			const action = hideThemesBanner();
			expect( action ).toEqual( {
				type: THEMES_BANNER_HIDE,
			} );
		} );
	} );

	describe( 'openThemesShowcase()', () => {
		test( 'Should return the expected action object', () => {
			const action = openThemesShowcase();
			expect( action ).toEqual( {
				type: THEMES_SHOWCASE_OPEN,
			} );
		} );
	} );

	describe( 'setThemesBookmark()', () => {
		test( 'Should return the expected action object', () => {
			const action = setThemesBookmark( 'abc' );
			expect( action ).toEqual( {
				type: THEMES_BOOKMARK_SET,
				payload: 'abc',
			} );
		} );
	} );
} );
