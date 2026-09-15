import { wpcom } from '../wpcom-fetcher';
import type { AgencySiteWithPlugin, PendingAgencySite } from './types';

export async function fetchAgencySitesWithPlugins(
	agencyId: number,
	plugins: string[]
): Promise< AgencySiteWithPlugin[] > {
	return wpcom.req.get(
		{
			apiNamespace: 'wpcom/v2',
			path: `/agency/${ agencyId }/sites`,
		},
		{
			filters: {
				plugins,
			},
		}
	);
}

/**
 * Sites the agency has purchased but not yet provisioned.
 */
export async function fetchPendingAgencySites( agencyId: number ): Promise< PendingAgencySite[] > {
	return wpcom.req.get( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/sites/pending`,
	} );
}
