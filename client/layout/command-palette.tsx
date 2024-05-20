import CommandPalette from '@automattic/command-palette';
import { useSiteExcerptsSorted } from 'calypso/data/sites/use-site-excerpts-sorted';
import { navigate } from 'calypso/lib/navigate';
import { useCommandsCalypso } from 'calypso/sites-dashboard/components/wpcom-smp-commands';
import { useSelector } from 'calypso/state';
import { closeCommandPalette } from 'calypso/state/command-palette/actions';
import { isCommandPaletteOpen as getIsCommandPaletteOpen } from 'calypso/state/command-palette/selectors';
import { getCurrentRoutePattern } from 'calypso/state/selectors/get-current-route-pattern';
import type { CommandPaletteProps } from '@automattic/command-palette';

interface CurrentUserCapabilitiesState {
	currentUser: {
		capabilities: {
			[ key: number ]: { [ key: string ]: boolean };
		};
	};
}

const getCurrentUserCapabilities = ( state: CurrentUserCapabilitiesState ) =>
	state.currentUser.capabilities;

const CalypsoCommandPalette = (
	props: Omit<
		CommandPaletteProps,
		| 'currentRoute'
		| 'isOpenGlobal'
		| 'onClose'
		| 'navigate'
		| 'useCommands'
		| 'useSites'
		| 'userCapabilities'
	>
) => {
	const isCommandPaletteOpen = useSelector( getIsCommandPaletteOpen );
	const currentRoutePattern = useSelector( getCurrentRoutePattern ) ?? '';
	const userCapabilities = useSelector( getCurrentUserCapabilities );

	return (
		<CommandPalette
			currentRoute={ currentRoutePattern }
			isOpenGlobal={ isCommandPaletteOpen }
			onClose={ closeCommandPalette }
			navigate={ navigate }
			useCommands={ useCommandsCalypso }
			useSites={ useSiteExcerptsSorted }
			userCapabilities={ userCapabilities }
			{ ...props }
		/>
	);
};

export default CalypsoCommandPalette;
