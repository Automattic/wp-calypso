import { recordTracksEvent } from '@automattic/calypso-analytics';

export const recordCommandPaletteOpen = (
	currentRoute: string,
	openType: 'keyboard' | 'sidebar_click'
) => {
	recordTracksEvent( 'calypso_hosting_command_palette_open', {
		current_route: currentRoute,
		opened_with: openType,
	} );
};
