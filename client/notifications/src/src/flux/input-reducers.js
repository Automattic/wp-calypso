import { actions } from './constants';

export default (state, action) => {
  var newState;

  switch (action.type) {
    case actions.DISABLE_KEYBOARD_SHORTCUTS:
    case actions.ENABLE_KEYBOARD_SHORTCUTS:
      let doEnable = action.type === actions.ENABLE_KEYBOARD_SHORTCUTS;

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
