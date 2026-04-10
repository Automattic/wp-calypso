import { fetchAgency } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const agencyQuery = () =>
	queryOptions( {
		queryKey: [ 'agency' ] as const,
		queryFn: async () => {
			const data = await fetchAgency();

			if ( Array.isArray( data ) ) {
				return { isClientUser: false, hasAgency: data.length > 0 };
			}

			return {
				isClientUser: !! data.is_client_user,
				hasAgency: false,
			};
		},
		staleTime: 5 * 60 * 1000,
		retry: false,
	} );
