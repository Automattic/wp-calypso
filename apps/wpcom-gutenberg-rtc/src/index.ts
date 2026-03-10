import { addFilter } from '@wordpress/hooks';
import { createPingHubProvider } from './providers/pinghub';

/**
 * Register providers (e.g. PingHub) supplied by the server, and disable HTTP polling by returning only this provider.
 */
function registerWpcomGutenbergProviders() {
	const getProviders = () => {
		if ( ! window.wpcomGutenbergRTC?.providers ) {
			return [];
		}

		return window.wpcomGutenbergRTC.providers
			.map( ( provider: string ) => {
				switch ( provider ) {
					case 'pinghub': {
						return createPingHubProvider();
					}
					default:
						return null;
				}
			} )
			.filter( Boolean );
	};

	addFilter( 'sync.providers', 'wpcom/gutenberg-rtc-providers', () => getProviders() );
}

registerWpcomGutenbergProviders();
