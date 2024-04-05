import {
	COMMAND_PALETTE_OPEN,
	COMMAND_PALETTE_CLOSE,
	COMMAND_PALETTE_OVERRIDE_COMMANDS,
	COMMAND_PALETTE_SELECT_COMMAND,
} from 'calypso/state/action-types';
import type { Command } from '@automattic/command-palette';

export const openCommandPalette = () => ( {
	type: COMMAND_PALETTE_OPEN,
} );

export const closeCommandPalette = () => ( {
	type: COMMAND_PALETTE_CLOSE,
} );

export const overrideCommandPaletteCommands = ( commands: Command[] ) => ( {
	type: COMMAND_PALETTE_OVERRIDE_COMMANDS,
	commands,
} );

export const selectCommandPaletteCommand = ( command: Command ) => ( {
	type: COMMAND_PALETTE_SELECT_COMMAND,
	command,
} );
