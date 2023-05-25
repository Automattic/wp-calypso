import { SiteDetails } from '@automattic/data-stores/src/site';
import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

export const useSiteQuery = ( sourceSiteSlug: string, enabled = true ) => {
	return useQuery( {
		queryKey: [ 'site-details', sourceSiteSlug ],
		queryFn: (): Promise< SiteDetails > =>
			wp.req.get( {
				path: '/sites/' + encodeURIComponent( sourceSiteSlug as string ),
			} ),
		meta: {
			persist: false,
		},
		enabled,
	} );
};
