import wpcom from 'calypso/lib/wp';

export interface LaunchpadTask {
	completed: boolean;
}

export interface Launchpad {
	checklist?: LaunchpadTask[] | null;
}

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
