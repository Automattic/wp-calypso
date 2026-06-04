import { fetchAgency, fetchAgencyScheduleCallLink } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import type { Agency } from '@automattic/api-core';

type AgencyQueryResult = {
	isClientUser: boolean;
	hasAgency: boolean;
};

export const agencyQuery = () =>
	queryOptions( {
		queryKey: [ 'agency' ] as const,
		queryFn: async () => {
			const data = await fetchAgency();
			let agency: AgencyQueryResult;

			if ( Array.isArray( data ) ) {
				agency = { isClientUser: false, hasAgency: data.length > 0 };
			} else {
				agency = {
					isClientUser: !! data.is_client_user,
					hasAgency: false,
				};
			}

			return agency;
		},
		// Agency membership rarely changes within a session, so we avoid
		// refetching on every mount, focus, and route-guard check.
		staleTime: 5 * 60 * 1000,
	} );

/**
 * Returns the active agency (the first one returned by the API), or null when
 * the current user is not an agency user.
 */
export const activeAgencyQuery = () =>
	queryOptions( {
		queryKey: [ 'agency', 'active' ] as const,
		queryFn: async (): Promise< Agency | null > => {
			const data = await fetchAgency();
			if ( Array.isArray( data ) ) {
				return data[ 0 ] ?? null;
			}
			return null;
		},
		staleTime: 5 * 60 * 1000,
		retry: false,
	} );

/**
 * Lazily fetches the growth-accelerator "schedule a call" link for an agency.
 * Disabled by default; trigger with `refetch()` on user interaction.
 */
export const agencyScheduleCallLinkQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'schedule-call-link' ] as const,
		queryFn: () => fetchAgencyScheduleCallLink( agencyId ),
		enabled: false,
		staleTime: 5 * 60 * 1000,
		retry: false,
	} );
