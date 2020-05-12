/**
 * Internal dependencies
 */

import { EDITOR_DEPRECATION_DIALOG_IS_SHOWING } from 'state/action-types';
import { combineReducers, withSchemaValidation } from 'state/utils';

function isEditorDeprecationDialogShowing( state = true, action ) {
	if ( action.type === EDITOR_DEPRECATION_DIALOG_IS_SHOWING ) {
		return action.isShowing;
	}
	return state;
}

export default combineReducers( {
	isShowing: withSchemaValidation( { type: 'boolean' }, isEditorDeprecationDialogShowing ),
} );
