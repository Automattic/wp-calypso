import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';

export type A4AAgencySite = {
	blog_id: number;
	url: string;
	url_with_scheme?: string;
	blogname?: string;
};

const PER_PAGE = 10;

export function useA4AAgencySites( agencyId: number | undefined, search: string ) {
	return useQuery( {
		queryKey: [ 'help-center-a4a-agency-sites', agencyId, search ],
		queryFn: async () => {
			const token = localStorage.getItem( 'wpcom_token' );

			const data = await wpcomRequest< { sites?: A4AAgencySite[] } >( {
				path: '/jetpack-agency/sites',
				apiNamespace: 'wpcom/v2',
				query: new URLSearchParams( {
					agency_id: String( agencyId ),
					per_page: String( PER_PAGE ),
					sort_field: 'url',
					sort_direction: 'asc',
					...( search ? { query: search } : {} ),
				} ).toString(),
				token: token ? JSON.parse( token ) : undefined,
			} );

			return data.sites ?? [];
		},
		enabled: !! agencyId,
		placeholderData: ( previousData ) => previousData,
		refetchOnWindowFocus: false,
		staleTime: 5 * 60 * 1000,
	} );
}
