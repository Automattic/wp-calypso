import { useQuery } from '@tanstack/react-query';
import { wpcom } from '../../wpcom-request';

export type ReadFeedSiteResponse = {
	ID: number;
	URL: string;
	description: string;
	feed_ID: number;
	feed_URL?: string;
	icon?: { ico: string; img: string };
	is_following: boolean;
};

const queryParams = {
	fields: [ 'ID', 'name', 'title', 'URL', 'icon', 'is_following', 'description' ].join( ',' ),
	options: [ 'is_mapped_domain', 'unmapped_url', 'is_redirect' ].join( ',' ),
};

const useReadFeedSiteQuery = ( siteId?: number ) => {
	return useQuery( {
		queryKey: [ 'read', 'sites', siteId, queryParams ],
		queryFn: async (): Promise< ReadFeedSiteResponse > => {
			return wpcom.req.get(
				{
					path: `/read/sites/${ siteId }`,
					apiVersion: '1.1',
				},
				queryParams
			);
		},
		enabled: typeof siteId === 'number' && siteId > 0,
	} );
};

export default useReadFeedSiteQuery;
