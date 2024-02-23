import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useCallback } from 'react';
import { CommandCallBackParams } from '../use-command-palette';

interface useCommandNavigationOptions {
	navigate: ( path: string, openInNewTab: boolean ) => void;
	currentRoute: string | null;
}

function useCommandNavigation( { navigate, currentRoute }: useCommandNavigationOptions ) {
	// Callback to navigate to a command's destination
	// used on command callback or siteFunctions onClick
	const commandNavigation = useCallback(
		( url: string, { openInNewTab = false } = {} ) =>
			( { close, command }: Pick< CommandCallBackParams, 'close' | 'command' > ) => {
				recordTracksEvent( 'calypso_hosting_command_palette_navigate', {
					command: command.name,
					current_route: currentRoute,
					is_wp_admin: url.includes( '/wp-admin' ),
				} );
				close();
				navigate( url, openInNewTab );
			},
		[ navigate, currentRoute ]
	);
	return commandNavigation;
}

export default useCommandNavigation;
