import { wpcom } from '../wpcom-fetcher';
import type { AgencySiteTag } from './types';

export async function updateAgencySiteTags(
	agencyId: number,
	siteId: number,
	tags: string[]
): Promise< AgencySiteTag[] > {
	return wpcom.req.put( {
		method: 'PUT',
		path: `/agency/${ agencyId }/sites/${ siteId }/tags`,
		apiNamespace: 'wpcom/v2',
		body: { tags },
	} );
}
