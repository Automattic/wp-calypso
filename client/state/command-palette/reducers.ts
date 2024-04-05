import {
	COMMAND_PALETTE_CLOSE,
	COMMAND_PALETTE_OPEN,
	COMMAND_PALETTE_OVERRIDE_COMMANDS,
	COMMAND_PALETTE_SELECT_COMMAND,
} from 'calypso/state/action-types';
import type { AnyAction } from 'redux';

const initialState = {
	isCommandPaletteOpen: false,
	customCommands: null,
	selectedCommand: null,
};

const commandPaletteReducer = ( state = initialState, action: AnyAction ) => {
	switch ( action.type ) {
		case COMMAND_PALETTE_OPEN:
			return { ...state, isCommandPaletteOpen: true };
		case COMMAND_PALETTE_CLOSE:
			return { ...state, isCommandPaletteOpen: false };
		case COMMAND_PALETTE_OVERRIDE_COMMANDS:
			return { ...state, customCommands: action.commands };
		case COMMAND_PALETTE_SELECT_COMMAND:
			return { ...state, selectedCommand: action.command };
		default:
			return state;
	}
};

export default commandPaletteReducer;
