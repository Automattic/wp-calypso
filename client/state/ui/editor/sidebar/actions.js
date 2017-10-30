/** @format */
/**
 * Internal dependencies
 */
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { EDITOR_NESTED_SIDEBAR_SET } from 'state/action-types';

export const openEditorSidebar = () => dispatch => {
	// dispatch( {
	// 	type: POST_EDITOR_SIDEBAR_OPEN,
	// } );
	dispatch( setLayoutFocus( 'sidebar' ) );
};

export const closeEditorSidebar = () => dispatch => {
	// dispatch( {
	// 	type: POST_EDITOR_SIDEBAR_CLOSE,
	// } );
	dispatch( setLayoutFocus( 'content' ) );
};

export const setNestedSidebar = target => ( {
	type: EDITOR_NESTED_SIDEBAR_SET,
	target,
} );
