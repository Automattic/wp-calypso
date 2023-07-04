import { useQuery } from '@tanstack/react-query';
import { buildQueryString } from '@wordpress/url';
import wpcomRequest from 'wpcom-proxy-request';

export type ReadFeedSiteResponse = {
	ID: number;
	URL: string;
	description: string;
	feed_ID: number;
	feed_URL?: string;
	icon?: { ico: string; img: string };
	is_following: boolean;
};

const urlQuery = buildQueryString( {
	fields: [ 'ID', 'name', 'title', 'URL', 'icon', 'is_following', 'description' ].join( ',' ),
	options: [ 'is_mapped_domain', 'unmapped_url', 'is_redirect' ].join( ',' ),
} );

const useReadFeedSiteQuery = ( siteId?: number ) => {
	return useQuery( {
		queryKey: [ 'read', 'sites', siteId, urlQuery ],
		queryFn: async () => {
			return wpcomRequest< ReadFeedSiteResponse >( {
				path: `/read/sites/${ siteId }`,
				query: urlQuery,
				apiVersion: '1.1',
				method: 'GET',
			} );
		},
		enabled: typeof siteId === 'number' && siteId >= 0,
	} );
};

export default useReadFeedSiteQuery;
