import { useQuery, UseQueryOptions } from 'react-query';
import wp from 'calypso/lib/wp';

export const USE_STAGING_SITE_QUERY_KEY = 'staging-site';

export interface StagingSite {
	id: number;
	name: string;
	url: string;
}

export const useStagingSite = ( siteId: number, options: UseQueryOptions ) => {
	return useQuery< Array< StagingSite >, unknown, Array< StagingSite > >(
		[ USE_STAGING_SITE_QUERY_KEY, siteId ],
		() =>
			wp.req.get( {
				path: `/sites/${ siteId }/staging-site`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			enabled: !! siteId && ( options.enabled ?? true ),
			select: ( data ) => {
				return data;
			},
			meta: {
				persist: false,
			},
			refetchOnWindowFocus: false,
		}
	);
};
