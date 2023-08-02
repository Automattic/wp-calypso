import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

const useSiteMonitorSettingsQuery = ( siteId ) =>
	useQuery( {
		queryKey: [ 'site-monitor-settings', siteId ],
		queryFn: () => wp.req.get( `/jetpack-blogs/${ siteId }` ),
		refetchOnWindowFocus: false,
		enabled: !! siteId,
		meta: {
			persist: false,
		},
	} );

export default useSiteMonitorSettingsQuery;
