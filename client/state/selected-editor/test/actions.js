/** @format */
/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { setSelectedEditor } from '../actions';
import { EDITOR_TYPE_SET } from 'state/action-types';

describe( 'actions', () => {
	describe( 'setSelectedEditor()', () => {
		test( 'should return an action object', () => {
			const action = setSelectedEditor( 2916284, 'gutenberg' );
			expect( action ).toEqual( {
				type: EDITOR_TYPE_SET,
				siteId: 2916284,
				editor: 'gutenberg',
			} );
		} );
	} );
} );
