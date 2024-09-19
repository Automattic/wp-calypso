import CommandPalette from '@automattic/command-palette';
import { useSiteExcerptsSorted } from 'calypso/data/sites/use-site-excerpts-sorted';
import { navigate } from 'calypso/lib/navigate';
import { useCommandsCalypso } from 'calypso/sites-dashboard/components/wpcom-smp-commands';
import { useDispatch, useSelector } from 'calypso/state';
import { closeCommandPalette } from 'calypso/state/command-palette/actions';
import { isCommandPaletteOpen as getIsCommandPaletteOpen } from 'calypso/state/command-palette/selectors';
import { getCurrentRoutePattern } from 'calypso/state/selectors/get-current-route-pattern';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

interface CurrentUserCapabilitiesState {
	currentUser: {
		capabilities: {
			[ key: number ]: { [ key: string ]: boolean };
		};
	};
}

// This selector is a bit too broad, but is needed to match the interface on CommandPalette.
// We're therefore keeping it private here, instead of making it available across Calypso.
const getCurrentUserCapabilities = ( state: CurrentUserCapabilitiesState ) =>
	state.currentUser.capabilities;

const CalypsoCommandPalette = () => {
	const dispatch = useDispatch();
	const isCommandPaletteOpen = useSelector( getIsCommandPaletteOpen );
	const currentRoutePattern = useSelector( getCurrentRoutePattern ) ?? '';
	const currentSiteId = useSelector( getSelectedSiteId );
	const userCapabilities = useSelector( getCurrentUserCapabilities );
	const onClose = () => dispatch( closeCommandPalette() );

	return (
		<CommandPalette
			currentRoute={ currentRoutePattern }
			currentSiteId={ currentSiteId }
			isOpenGlobal={ isCommandPaletteOpen }
			onClose={ onClose }
			navigate={ navigate }
			useCommands={ useCommandsCalypso }
			useSites={ useSiteExcerptsSorted }
			userCapabilities={ userCapabilities }
		/>
	);
};

export default CalypsoCommandPalette;
