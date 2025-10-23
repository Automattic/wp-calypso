import CommandPalette from '@automattic/command-palette';
import { createRoot } from 'react-dom/client';
import setLocale from './set-locale';
import { useCommandsWpAdmin } from './use-commands';
import { useSites } from './use-sites';

export function mount( { openImmediately = false } = {} ) {
	if ( ! window.commandPaletteConfig ) {
		// Can't load the command palette without a config.
		return null;
	}

	const {
		siteId,
		isAtomic = false,
		isSimple = false,
		capabilities,
	} = window?.commandPaletteConfig || {};

	if ( ! isSimple && ! isAtomic ) {
		return;
	}

	const currentRoute = window.location.pathname + window.location.search;

	const navigate = ( url, openInNewTab ) => window.open( url, openInNewTab ? '_blank' : '_self' );

	setLocale();

	const userCapabilities = { [ siteId ]: capabilities };

	const container = document.createElement( 'div' );
	document.body.appendChild( container );

	const root = createRoot( container );
	root.render(
		<CommandPalette
			navigate={ navigate }
			currentRoute={ currentRoute }
			useCommands={ useCommandsWpAdmin }
			currentSiteId={ siteId }
			useSites={ useSites }
			userCapabilities={ userCapabilities }
			isOpenGlobal={ openImmediately }
		/>
	);
}
