import { CommandPalette } from '@automattic/command-palette';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import domReady from '@wordpress/dom-ready';
import { render } from 'react-dom';
import WPCOM from 'wpcom';
import proxyRequest from 'wpcom-proxy-request';

function wpcomInitCommandPalette() {
	const wpcom = new WPCOM( proxyRequest );
	wpcom.request( { metaAPI: { accessAllUsersBlogs: true } } );

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
			<CommandPalette navigate={ navigate } wpcom={ wpcom } />
		</QueryClientProvider>,
		commandPaletteContainer
	);
}

domReady( wpcomInitCommandPalette );
