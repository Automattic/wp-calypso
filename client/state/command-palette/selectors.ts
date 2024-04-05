import 'calypso/state/command-palette/init';
import type { AppState } from 'calypso/types';

export const isCommandPaletteOpen = ( state: AppState ) =>
	state.commandPalette.isCommandPaletteOpen;

export const getCommandPaletteCustomCommands = ( state: AppState ) =>
	state.commandPalette.customCommands;

export const getCommandPaletteSelectedCommand = ( state: AppState ) =>
	state.commandPalette.selectedCommand;
