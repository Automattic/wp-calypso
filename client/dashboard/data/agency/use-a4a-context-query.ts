import { useQuery } from '@tanstack/react-query';
import { wpcomA4ARequest } from './wpcom-a4a-request';

/**
 * Temporary location.
 *
 * This is dashboard-local while A4A routing/entrypoints/auth are still evolving.
 * Once stabilized, we should move the query builder into `@automattic/api-queries`
 */

/**
 * Response from GET /wpcom/v2/agency.
 * Either an array of agencies (agency user) or client-user payload.
 */
type AgencyApiResponse =
	| { id: number; name: string }[] // agency list
	| { is_client_user: boolean; billing_type?: string };

export const A4A_CONTEXT_QUERY_KEY = [ 'a4a', 'agency-context' ] as const;

export function useA4AContextQuery( enabled: boolean ) {
	return useQuery( {
		queryKey: A4A_CONTEXT_QUERY_KEY,
		queryFn: async (): Promise< { isClientUser: boolean; hasAgency: boolean } > => {
			const data = await wpcomA4ARequest< AgencyApiResponse >( {
				apiNamespace: 'wpcom/v2',
				path: '/agency',
			} );

			if ( Array.isArray( data ) ) {
				return { isClientUser: false, hasAgency: data.length > 0 };
			}
			return {
				isClientUser: !! data.is_client_user,
				hasAgency: false,
			};
		},
		enabled,
		staleTime: 5 * 60 * 1000,
		retry: false,
	} );
}
