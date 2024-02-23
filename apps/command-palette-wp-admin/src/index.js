import CommandPalette, {
	useAtomicCommands,
	useAtomicLimitedCommands,
	useWpcomSimpleSiteLimitedCommands,
	useWpcomSimpleSiteCommands,
} from '@automattic/command-palette';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import domReady from '@wordpress/dom-ready';
import { render } from 'react-dom';
import WPCOM from 'wpcom';
import proxyRequest from 'wpcom-proxy-request';

function CommandPaletteApp() {
	const wpcom = new WPCOM( proxyRequest );
	wpcom.request( { metaAPI: { accessAllUsersBlogs: true } } );

	if ( ! window.commandPaletteConfig ) {
		// Can't load the command palette without a config.
		return null;
	}

	const currentRoute = window.location.pathname;
	const siteHostname = window.location.hostname;

	const navigate = ( path, openInNewTab ) => {
		if ( path.startsWith( '/' ) && ! path.startsWith( '/wp-admin' ) ) {
			path = `https://wordpress.com${ path }/${ siteHostname }`;
		}

		window.open( path, openInNewTab ? '_blank' : '_self' );
	};

	const {
		isAdmin = false,
		isAtomic = false,
		isSelfHosted = false,
		isSimple = false,
	} = window?.commandPaletteConfig || {};

	let useCommands;
	if ( isAtomic && ! isSelfHosted ) {
		useCommands = isAdmin ? useAtomicCommands : useAtomicLimitedCommands;
	}

	if ( isSimple ) {
		useCommands = isAdmin ? useWpcomSimpleSiteCommands : useWpcomSimpleSiteLimitedCommands;
	}

	if ( ! useCommands ) {
		// Can't load the command palette without a valid commands provider function.
		return null;
	}

	return (
		<QueryClientProvider client={ new QueryClient() }>
			<CommandPalette
				navigate={ navigate }
				wpcom={ wpcom }
				currentRoute={ currentRoute }
				useCommands={ useCommands }
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
