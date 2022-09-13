import { useQuery, UseQueryResult } from 'react-query';
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

export function useThemeDetails( slug: string ): UseQueryResult< Theme > {
	return useQuery< Theme >(
		`theme-details-${ slug }`,
		() => wpcom.req.get( `/themes/${ slug }`, { apiVersion: '1.2' } ),
		{
			staleTime: Infinity,
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
		}
	);
}
