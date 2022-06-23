import { useQuery, UseQueryResult, UseQueryOptions } from 'react-query';
import wpcom from 'calypso/lib/wp';

type Theme = {
	id: string;
	name: string;
	author: string;
	author_uri: string;
	description: string;
	date_updated: string;
	taxonomies: Record< string, [] >;
};

export function useThemeDetails(
	slug: string,
	queryOptions: UseQueryOptions< any, unknown, Theme > = {}
): UseQueryResult< Theme > {
	return useQuery< any, unknown, Theme >(
		'theme-details',
		() => wpcom.req.get( `/themes/${ slug }`, { apiVersion: '1.1' } ),
		{
			staleTime: Infinity,
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			...queryOptions,
			meta: {
				...queryOptions.meta,
			},
		}
	);
}
