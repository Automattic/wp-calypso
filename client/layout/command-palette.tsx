import CommandPalette from '@automattic/command-palette';
import { useSiteExcerptsSorted } from 'calypso/data/sites/use-site-excerpts-sorted';
import { useCommandsCalypso } from 'calypso/sites-dashboard/components/wpcom-smp-commands';
import type { CommandPaletteProps } from '@automattic/command-palette';

const CalypsoCommandPalette = ( {
	currentRoute,
	currentSiteId,
	isOpenGlobal,
	navigate,
	onClose = () => {},
	userCapabilities,
	selectedCommand,
	onBack,
	shouldCloseOnClickOutside,
}: Omit< CommandPaletteProps, 'useCommands' | 'useSites' > ) => {
	return (
		<CommandPalette
			currentRoute={ currentRoute }
			currentSiteId={ currentSiteId }
			isOpenGlobal={ isOpenGlobal }
			navigate={ navigate }
			onClose={ onClose }
			userCapabilities={ userCapabilities }
			selectedCommand={ selectedCommand }
			onBack={ onBack }
			shouldCloseOnClickOutside={ shouldCloseOnClickOutside }
			useCommands={ useCommandsCalypso }
			useSites={ useSiteExcerptsSorted }
		/>
	);
};

export default CalypsoCommandPalette;
