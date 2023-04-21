import { useQuery } from 'react-query';
import wp from 'calypso/lib/wp';

const useSiteMonitorSettingsQuery = ( siteId ) =>
	useQuery( [ 'site-monitor-settings', siteId ], () => wp.req.get( `/jetpack-blogs/${ siteId }` ), {
		refetchOnWindowFocus: false,
		enabled: !! siteId,
		meta: {
			persist: false,
		},
	} );

export default useSiteMonitorSettingsQuery;
