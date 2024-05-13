import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

const useSiteSettingsQuery = ( siteId: number | null ) =>
	useQuery( {
		queryKey: [ 'site-settings', siteId ],
		queryFn: () => wp.req.get( `/sites/${ siteId }/settings`, { apiVersion: '1.4' } ),
		refetchOnWindowFocus: false,
		enabled: !! siteId,
		meta: {
			persist: false,
		},
	} );

export default useSiteSettingsQuery;
