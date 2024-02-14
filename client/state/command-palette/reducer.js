import { COMMAND_PALETTE_CLOSE, COMMAND_PALETTE_OPEN } from 'calypso/state/action-types';

const initialState = {
	isCommandPaletteOpen: false,
};

const commandPaletteReducer = ( state = initialState, action ) => {
	switch ( action.type ) {
		case COMMAND_PALETTE_OPEN:
			return { ...state, isCommandPaletteOpen: true };
		case COMMAND_PALETTE_CLOSE:
			return { ...state, isCommandPaletteOpen: false };
		default:
			return state;
	}
};

export default commandPaletteReducer;
