import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

export default function useFetchSitePlugins( siteId: number ) {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery( {
		queryKey: [ 'a4a-site-plugins', siteId ],
		queryFn: () =>
			wpcom.req.get( {
				apiNamespace: 'wp/v2',
				path: `/sites/${ siteId }/plugins`,
			} ),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
	} );
}
