import wpcom from 'calypso/lib/wp';
import type { PluginsResponse } from '../declarative-flow/internals/types';

const wait = ( ms: number ) => new Promise( ( res ) => setTimeout( res, ms ) );

/**
 * Poll /sites/:siteId/plugins until every plugin in `pluginsToVerify` is
 * installed and active. Errors are swallowed (the endpoint 403s until the
 * site is Atomic). Throws on timeout.
 */
export const waitForPluginsActive = async (
	siteId: number,
	pluginsToVerify: string[] | undefined
): Promise< void > => {
	const startTime = new Date().getTime();
	const totalTimeout = 1000 * 300;
	const maxFinishTime = startTime + totalTimeout;

	// Poll for transfer status. If there are no plugins to verify, we can skip this step.
	let stopPollingPlugins = ! pluginsToVerify || pluginsToVerify.length <= 0;
	let backoffTime = 1000;

	while ( ! stopPollingPlugins ) {
		await wait( backoffTime );

		try {
			const response: PluginsResponse = await wpcom.req.get( {
				path: `/sites/${ siteId }/plugins`,
				apiVersion: '1.1',
			} );

			// Check that all plugins to verify have been installed and activated.
			// If they _have_ been installed and activated, we can stop polling.
			if ( response?.plugins && pluginsToVerify ) {
				stopPollingPlugins = pluginsToVerify.every( ( slug ) => {
					return response?.plugins.find(
						( plugin: { slug: string; active: boolean } ) =>
							plugin.slug === slug && plugin.active === true
					);
				} );
			}
		} catch ( err ) {
			// Ignore errors. It's normal to get errors the first couple of times we poll. The timeout will eventually catch it if the failures continue.
		}

		if ( maxFinishTime <= new Date().getTime() ) {
			throw new Error( `plugin check timeout exceeded ${ totalTimeout / 1000 }s` );
		}

		backoffTime *= 2;
	}
};
