import { fetchSiteUptime } from '../../data/site-jetpack-monitor-uptime';

export const siteUptimeQuery = ( siteId: number, options: { period?: string } = {} ) => ( {
	queryKey: [ 'site', siteId, 'uptime', options ],
	queryFn: () => fetchSiteUptime( siteId, options ),
} );
