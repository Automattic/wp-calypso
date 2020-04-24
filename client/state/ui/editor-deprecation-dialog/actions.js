/**
 * Internal dependencies
 */
import { EDITOR_DEPRECATION_DIALOG_IS_SHOWING } from 'state/action-types';

export function showEditorDeprecationDialog() {
	return {
		type: EDITOR_DEPRECATION_DIALOG_IS_SHOWING,
		isShowing: true,
	};
}

export function hideEditorDeprecationDialog() {
	return {
		type: EDITOR_DEPRECATION_DIALOG_IS_SHOWING,
		isShowing: false,
	};
}
