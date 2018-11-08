/** @format */

/**
 * Internal dependencies
 */

import { GUTENBERG_BLOCKS_WARNING_DIALOG_IS_SHOWING } from 'state/action-types';
import { combineReducers } from 'state/utils';

function isGutenbergBlocksWarningDialogShowing( state = false, action ) {
	if ( action.type === GUTENBERG_BLOCKS_WARNING_DIALOG_IS_SHOWING ) {
		return action.isShowing;
	}
	return state;
}

export default combineReducers( {
	isShowing: isGutenbergBlocksWarningDialogShowing,
} );
