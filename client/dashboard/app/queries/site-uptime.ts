import { fetchSiteUptime } from '../../data/site-jetpack-monitor-uptime';

export const siteUptimeQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'uptime' ],
	queryFn: () => fetchSiteUptime( siteId ),
} );
