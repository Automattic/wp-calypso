/**
 * Internal dependencies
 */
import { actions } from './constants';
import store from './store';

export const disableKeyboardShortcuts = () => {
	store.dispatch( {
		type: actions.DISABLE_KEYBOARD_SHORTCUTS,
	} );
};

export const enableKeyboardShortcuts = () => {
	store.dispatch( {
		type: actions.ENABLE_KEYBOARD_SHORTCUTS,
	} );
};
