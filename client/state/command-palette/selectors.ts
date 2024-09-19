import 'calypso/state/command-palette/init';
import type { AppState } from 'calypso/types';

export const isCommandPaletteOpen = ( state: AppState ) =>
	state.commandPalette.isCommandPaletteOpen;
