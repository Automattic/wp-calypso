import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { GlobalStylesObject } from '@automattic/global-styles';

type Theme = {
	id: string;
	name: string;
	author: string;
	author_uri: string;
	demo_uri?: string;
	description: string;
	date_updated: string;
	price: string;
	taxonomies: Record< string, [] >;
	theme_type: string;
	theme_tier: {
		feature: string;
		slug: string;
		platform: string;
	};
	style_variations: GlobalStylesObject[];
};

export function useThemeDetails( slug = '' ): UseQueryResult< Theme > {
	return useQuery< Theme >( {
		queryKey: [ 'theme-details', slug ],
		queryFn: () => wpcom.req.get( `/themes/${ slug }`, { apiVersion: '1.2' } ),
		staleTime: 60 * 5 * 1000,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		enabled: !! slug,
	} );
}
