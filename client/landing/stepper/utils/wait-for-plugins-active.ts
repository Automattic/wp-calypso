import wpcom from 'calypso/lib/wp';
import type { PluginsResponse } from '../declarative-flow/internals/types';

const wait = ( ms: number ) => new Promise( ( resolve ) => setTimeout( resolve, ms ) );

interface WaitForPluginsActiveOptions {
	timeoutMs?: number;
	initialBackoffMs?: number;
}

/**
 * Poll /sites/:siteId/plugins until every plugin in `pluginSlugs` is installed
 * and active. Errors from the endpoint are swallowed (it returns 403 until
 * the site is Atomic), so callers should ensure the transfer is in progress
 * before invoking this. Throws on timeout.
 */
export const waitForPluginsActive = async (
	siteId: number,
	pluginSlugs: string[],
	{ timeoutMs = 1000 * 300, initialBackoffMs = 1000 }: WaitForPluginsActiveOptions = {}
): Promise< void > => {
	if ( pluginSlugs.length === 0 ) {
		return;
	}

	const maxFinishTime = Date.now() + timeoutMs;
	let backoff = initialBackoffMs;

	while ( true ) {
		await wait( backoff );

		try {
			const response: PluginsResponse = await wpcom.req.get( {
				path: `/sites/${ siteId }/plugins`,
				apiVersion: '1.1',
			} );
			const allActive = pluginSlugs.every(
				( slug ) => response?.plugins?.some( ( plugin ) => plugin.slug === slug && plugin.active )
			);
			if ( allActive ) {
				return;
			}
		} catch {
			// Ignore: the endpoint 403s until the site is Atomic.
		}

		if ( Date.now() >= maxFinishTime ) {
			throw new Error( `plugin check timeout exceeded ${ timeoutMs / 1000 }s` );
		}

		backoff *= 2;
	}
};
