import wpcom from 'calypso/lib/wp';

export interface ActivityLogEntry {
	published: string;
}

export interface ActivityLog {
	current: {
		orderedItems: ActivityLogEntry[];
	};
}

export async function fetchSiteRewindableActivityLog(
	siteId: number,
	{ number }: { number: number }
): Promise< ActivityLog > {
	return wpcom.req.get(
		{
			path: `/sites/${ siteId }/activity/rewindable`,
			apiNamespace: 'wpcom/v2',
		},
		{
			number,
		}
	);
}
