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
		/>
	);
	// If openImmediately is true, trigger the open after initial render
	// This allows the palette to open once but still be closeable
	if ( openImmediately ) {
		// Use setTimeout to ensure the component is fully mounted before opening
		setTimeout( () => {
			// Simulate the keyboard shortcut that opens the palette (Cmd+K)
			const event = new KeyboardEvent( 'keydown', {
				key: 'k',
				code: 'KeyK',
				metaKey: true,
				ctrlKey: false,
				bubbles: true,
			} );
			document.dispatchEvent( event );
		}, 0 );
	}
}
