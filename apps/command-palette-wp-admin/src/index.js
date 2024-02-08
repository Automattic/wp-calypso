import CommandPalette from '@automattic/command-palette';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import domReady from '@wordpress/dom-ready';
import { render } from 'react-dom';

function wpcomInitCommandPalette() {
	const navigate = ( path, openInNewTab ) => {
		window.open(
			path.startsWith( '/' ) ? `https://wordpress.com${ path }` : path,
			openInNewTab ? '_blank' : '_self'
		);
	};

	const commandPaletteContainer = document.createElement( 'div' );
	document.body.appendChild( commandPaletteContainer );

	const queryClient = new QueryClient();

	render(
		<QueryClientProvider client={ queryClient }>
			<CommandPalette navigate={ navigate } />
		</QueryClientProvider>,
		commandPaletteContainer
	);
}

domReady( wpcomInitCommandPalette );
