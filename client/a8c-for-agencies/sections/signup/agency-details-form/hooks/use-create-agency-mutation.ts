import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { APIError, APIAgency } from 'calypso/state/a8c-for-agencies/types';
import { AgencyDetailsPayload } from '../types';

function createAgency( details: AgencyDetailsPayload ): Promise< APIAgency > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/agency',
		body: {
			agency_name: details.agencyName,
			agency_url: details.agencyUrl,
			address_line1: details.line1,
			address_line2: details.line2,
			address_city: details.city,
			address_country: details.country,
			address_state: details.state,
			address_postal_code: details.postalCode,
		},
	} );
}

export default function useCreateAgencyMutation< TContext = unknown >(
	options?: UseMutationOptions< APIAgency, APIError, AgencyDetailsPayload, TContext >
): UseMutationResult< APIAgency, APIError, AgencyDetailsPayload, TContext > {
	return useMutation< APIAgency, APIError, AgencyDetailsPayload, TContext >( {
		...options,
		mutationFn: createAgency,
	} );
}
