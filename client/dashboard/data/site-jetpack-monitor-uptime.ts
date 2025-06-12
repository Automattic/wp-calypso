import wpcom from 'calypso/lib/wp';

export interface SiteUptime {
	[ key: string ]: { status: string; downtime_in_minutes?: number };
}

export async function fetchSiteUptime( siteId: number ): Promise< SiteUptime | undefined > {
	return wpcom.req.get(
		{
			path: `/sites/${ siteId }/jetpack-monitor-uptime`,
			apiNamespace: 'wpcom/v2',
		},
		{ period: '30 days' }
	);
}
