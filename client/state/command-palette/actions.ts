import { COMMAND_PALETTE_OPEN, COMMAND_PALETTE_CLOSE } from 'calypso/state/action-types';

export const openCommandPalette = () => ( {
	type: COMMAND_PALETTE_OPEN,
} );

export const closeCommandPalette = () => ( {
	type: COMMAND_PALETTE_CLOSE,
} );
