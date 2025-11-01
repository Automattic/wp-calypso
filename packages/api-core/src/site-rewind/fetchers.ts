import { wpcom } from '../wpcom-fetcher';
import type { RewindState } from './types';

/**
 * Fetch the rewind state for a site from the VaultPress platform.
 * @param siteId - The ID of the site.
 * @returns A promise that resolves to the rewind state.
 */
export async function fetchSiteRewindState( siteId: number ): Promise< RewindState > {
	return wpcom.req.get( {
		apiNamespace: 'wpcom/v2',
		path: `/sites/${ siteId }/rewind`,
		query: { force: 'wpcom' },
	} );
}
