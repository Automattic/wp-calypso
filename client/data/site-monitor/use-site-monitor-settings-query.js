import { useQuery } from 'react-query';
import wp from 'calypso/lib/wp';

const useSiteMonitorSettingsQuery = ( siteId ) =>
	useQuery( [ 'site-monitor-settings', siteId ], () => wp.req.get( `/jetpack-blogs/${ siteId }` ), {
		refetchOnWindowFocus: false,
		meta: {
			persist: false,
		},
	} );

export default useSiteMonitorSettingsQuery;
