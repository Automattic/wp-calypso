/**
 * Internal dependencies
 */
import { setThemesBookmark } from '../actions';
import { THEMES_BOOKMARK_SET } from 'calypso/state/themes/action-types';

describe( 'actions', () => {
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
