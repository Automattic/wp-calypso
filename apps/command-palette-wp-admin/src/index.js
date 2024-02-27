import CommandPalette, { useSingleSiteCommands } from '@automattic/command-palette';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import domReady from '@wordpress/dom-ready';
import { render } from 'react-dom';

function CommandPaletteApp() {
	if ( ! window.commandPaletteConfig ) {
		// Can't load the command palette without a config.
		return null;
	}

	const { siteId, isAtomic = false, isSimple = false } = window?.commandPaletteConfig || {};

	if ( ! isSimple && ! isAtomic ) {
		return;
	}

	const currentRoute = window.location.pathname;

	const navigate = ( path, openInNewTab ) => {
		const siteHostname = window.location.hostname;
		let url = path;

		if ( path.startsWith( '/' ) && ! path.startsWith( '/wp-admin' ) ) {
			url = `https://wordpress.com${ path }`;
		}

		url = url.replace( ':site', siteHostname );
		url = url.replace( ':siteId', siteId );

		if ( url.startsWith( siteHostname ) ) {
			url = url.replace( siteHostname, window.location.origin );
		}

		window.open( url, openInNewTab ? '_blank' : '_self' );
	};

	return (
		<QueryClientProvider client={ new QueryClient() }>
			<CommandPalette
				navigate={ navigate }
				currentRoute={ currentRoute }
				useCommands={ useSingleSiteCommands }
				currentSiteId={ siteId }
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
