import { fetchAgency } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

type AgencyQueryResult = {
	isClientUser: boolean;
	hasAgency: boolean;
};

function maybeRedirectToSignup( agency: AgencyQueryResult ) {
	if ( typeof window === 'undefined' ) {
		return;
	}

	if (
		window.location.pathname === '/signup' ||
		window.location.pathname.startsWith( '/signup/' )
	) {
		return;
	}

	if ( ! agency.isClientUser && ! agency.hasAgency ) {
		window.location.replace( '/signup' );
	}
}

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

			maybeRedirectToSignup( agency );

			return agency;
		},
		staleTime: 5 * 60 * 1000,
		retry: false,
	} );
