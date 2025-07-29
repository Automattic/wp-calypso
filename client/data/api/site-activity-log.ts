import wpcom from 'calypso/lib/wp';

export interface ActivityLogEntry {
	activity_id: string;
	actor: {
		name: string;
	};
	content: {
		text: string;
	};
	gridicon: string;
	published: string;
	summary: string;
}

export interface ActivityLog {
	current?: {
		orderedItems: ActivityLogEntry[];
	};
}

export async function fetchSiteActivityLog(
	siteId: number,
	{ number }: { number: number }
): Promise< ActivityLog > {
	return wpcom.req.get(
		{
			path: `/sites/${ siteId }/activity`,
			apiNamespace: 'wpcom/v2',
		},
		{
			number,
		}
	);
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
