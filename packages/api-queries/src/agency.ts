import { fetchAgency } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

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
