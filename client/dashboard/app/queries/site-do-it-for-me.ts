import { queryOptions } from '@tanstack/react-query';
import { fetchDifmWebsiteContent } from '../../data/site-do-it-for-me';

export const siteDifmWebsiteContentQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'difm-website-content' ],
		queryFn: () => fetchDifmWebsiteContent( siteId ),
		meta: { persist: false },
		staleTime: Infinity,
	} );
