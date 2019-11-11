import { actions } from './constants';

export default ( state, action ) => {
	let newState;

	switch ( action.type ) {
		case actions.DISABLE_KEYBOARD_SHORTCUTS:
		case actions.ENABLE_KEYBOARD_SHORTCUTS:
			const doEnable = action.type === actions.ENABLE_KEYBOARD_SHORTCUTS;

			// Remove when no more components still rely on this global
			state.global.keyboardShortcutsAreEnabled = doEnable;
			newState = {
				...state,
				input: {
					...state.input,
					shortcutsAreEnabled: doEnable,
				},
			};
			break;

		default:
			newState = state;
			break;
	}

	return newState;
};
