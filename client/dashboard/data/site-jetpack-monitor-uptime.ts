import wpcom from 'calypso/lib/wp';

export interface SiteUptime {
	status: 'up' | 'down' | 'monitor_inactive';
	downtime_in_minutes?: number;
}

export async function fetchSiteUptime( siteId: number, period?: string ): Promise< number | null > {
	const uptime: Record< string, SiteUptime > = await wpcom.req.get(
		{
			path: `/sites/${ siteId }/jetpack-monitor-uptime`,
			apiNamespace: 'wpcom/v2',
		},
		{ period: period ?? '30 days' }
	);

	// Post-process the data to calculate total number for up and down days during the time period.
	const { upDays, downDays } = Object.values( uptime ).reduce(
		( accumulator, { status } ) => {
			if ( status === 'monitor_inactive' ) {
				return accumulator;
			}

			accumulator[ status === 'up' ? 'upDays' : 'downDays' ] += 1;
			return accumulator;
		},
		{ upDays: 0, downDays: 0 }
	);

	if ( ! upDays && ! downDays ) {
		return null;
	}

	// Calculate the uptime percentage.
	return Math.round( ( upDays / ( upDays + downDays ) ) * 1000 ) / 10;
}
