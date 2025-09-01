import { wpcom } from '../wpcom-fetcher';
import type { Launchpad } from './types';

export async function fetchSiteLaunchpad(
	siteId: number,
	checklistSlug: string
): Promise< Launchpad > {
	return wpcom.req.get(
		{
			path: `/sites/${ siteId }/launchpad`,
			apiNamespace: 'wpcom/v2',
		},
		{
			checklist_slug: checklistSlug,
			launchpad_context: 'sites-dashboard',
		}
	);
}
