/**
 * Internal dependencies
 */
import { openThemesShowcase, setThemesBookmark } from '../actions';
import { THEMES_SHOWCASE_OPEN, THEMES_BOOKMARK_SET } from 'calypso/state/themes/action-types';

describe( 'actions', () => {
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
