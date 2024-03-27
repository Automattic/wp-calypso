import { SiteDetails } from '@automattic/data-stores';
import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

export const useSitesQuery = () => {
	return useQuery( {
		queryKey: [ 'sites' ],
		queryFn: (): Promise< { sites: SiteDetails[] } > =>
			wp.req.get( {
				path: '/me/sites',
			} ),
		select: ( data ) => data.sites.filter( ( site ) => site.is_wpcom_atomic === true ),
	} );
};
