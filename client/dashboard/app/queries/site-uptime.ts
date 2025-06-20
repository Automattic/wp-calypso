import { fetchSiteUptime } from '../../data/site-jetpack-monitor-uptime';

export const siteUptimeQuery = ( siteId: number, period?: string ) => ( {
	queryKey: [ 'site', siteId, 'uptime', period ],
	queryFn: () => fetchSiteUptime( siteId, period ),
} );
