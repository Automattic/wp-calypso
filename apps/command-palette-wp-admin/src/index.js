import CommandPalette from '@automattic/command-palette';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import domReady from '@wordpress/dom-ready';
import { render } from 'react-dom';
import setLocale from './set-locale';
import { useCommandsWpAdmin } from './use-commands';
import { useSites } from './use-sites';

function CommandPaletteApp() {
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

	const locale = document.documentElement.lang ?? 'en';
	setLocale( locale );

	const userCapabilities = { [ siteId ]: capabilities };

	return (
		<QueryClientProvider client={ new QueryClient() }>
			<CommandPalette
				currentRoute={ currentRoute }
				useCommands={ useCommandsWpAdmin }
				currentSiteId={ siteId }
				useSites={ useSites }
				userCapabilities={ userCapabilities }
			/>
		</QueryClientProvider>
	);
}

function wpcomInitCommandPalette() {
	const commandPaletteContainer = document.createElement( 'div' );
	document.body.appendChild( commandPaletteContainer );

	render( <CommandPaletteApp />, commandPaletteContainer );
}

domReady( wpcomInitCommandPalette );
