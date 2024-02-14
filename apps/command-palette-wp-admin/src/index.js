import CommandPalette from '@automattic/command-palette';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import domReady from '@wordpress/dom-ready';
import { render } from 'react-dom';
import setLocale from './locale';

async function wpcomInitCommandPalette() {
	const navigate = ( path, openInNewTab ) => {
		window.open(
			path.startsWith( '/' ) ? `https://wordpress.com${ path }` : path,
			openInNewTab ? '_blank' : '_self'
		);
	};

	const commandPaletteContainer = document.createElement( 'div' );
	document.body.appendChild( commandPaletteContainer );

	const queryClient = new QueryClient();

	// TODO: Need to get this from the user settings.
	setLocale( 'tr' );

	render(
		<QueryClientProvider client={ queryClient }>
			<CommandPalette navigate={ navigate } />
		</QueryClientProvider>,
		commandPaletteContainer
	);
}

domReady( wpcomInitCommandPalette );
