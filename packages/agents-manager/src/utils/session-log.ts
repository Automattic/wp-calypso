import apiFetch from '@wordpress/api-fetch';
import { getActiveSessionId } from './agent-session';
import { getIsTest } from './tracks';

/**
 * The Big Sky session log: a record of what a site-build session changed,
 * written to Big Sky's own endpoints and separate from Tracks.
 *
 * Big Sky's `getSessionId` prefers the Calypso-registered id over its own, so
 * entries written here land on the same session as the ones Big Sky writes.
 *
 * Best-effort throughout: a lost log must never fail the edit that produced it.
 */

const SESSION_PATH = '/wpcom/v2/big-sky/v1/session';

const getBigSkyVersion = (): string =>
	String(
		( window as { bigSkyInitialState?: { bigSkyVersion?: unknown } } ).bigSkyInitialState
			?.bigSkyVersion ?? '0'
	);

async function post( suffix: string, data: Record< string, unknown > ): Promise< void > {
	const sessionId = getActiveSessionId();

	if ( ! sessionId ) {
		return;
	}

	try {
		await apiFetch( {
			path: `${ SESSION_PATH }/${ encodeURIComponent( sessionId ) }${ suffix }`,
			method: 'POST',
			data,
		} );
	} catch {
		// Best-effort.
	}
}

/** Records the site metadata as it stands after a change. */
export async function logSiteMetadata( metadata: Record< string, unknown > ): Promise< void > {
	await post( '/metadata', { ...metadata, big_sky_version: getBigSkyVersion() } );
}

/** Names the session after the site, so the log follows a site rename. */
export async function logSiteSession( name: string ): Promise< void > {
	await post( '', { name, is_test: getIsTest(), big_sky_version: getBigSkyVersion() } );
}
