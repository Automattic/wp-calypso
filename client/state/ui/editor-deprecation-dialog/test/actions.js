/**
 * Internal dependencies
 */
import { showEditorDeprecationDialog, hideEditorDeprecationDialog } from '../actions';
import { EDITOR_DEPRECATION_DIALOG_IS_SHOWING } from 'state/action-types';

describe( 'actions', () => {
	describe( 'showEditorDeprecationDialog()', () => {
		test( 'should return an action object', () => {
			const action = showEditorDeprecationDialog();

			expect( action ).toEqual( {
				type: EDITOR_DEPRECATION_DIALOG_IS_SHOWING,
				isShowing: true,
			} );
		} );
	} );

	describe( 'hideEditorDeprecationDialog()', () => {
		test( 'should return an action object', () => {
			const action = hideEditorDeprecationDialog();

			expect( action ).toEqual( {
				type: EDITOR_DEPRECATION_DIALOG_IS_SHOWING,
				isShowing: false,
			} );
		} );
	} );
} );
