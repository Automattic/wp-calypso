/**
 * Internal dependencies
 */
import { EDITOR_DEPRECATION_DIALOG_IS_SHOWING } from 'state/action-types';

export function hideEditorDeprecationDialog() {
	return {
		type: EDITOR_DEPRECATION_DIALOG_IS_SHOWING,
		isShowing: false,
	};
}
