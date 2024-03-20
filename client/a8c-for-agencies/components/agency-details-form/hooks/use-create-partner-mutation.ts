import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { APIError, APIPartner } from 'calypso/state/partner-portal/types';
import { AgencyDetailsPayload } from '../types';

function createPartner( details: AgencyDetailsPayload ): Promise< APIPartner > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/agency',
		body: {
			agency_name: details.agencyName,
			agency_url: details.businessUrl,
			address_line1: details.line1,
			address_line2: details.line2,
			address_city: details.city,
			address_country: details.country,
			address_state: details.state,
			address_postal_code: details.postalCode,
		},
	} );
}

export default function useCreatePartnerMutation< TContext = unknown >(
	options?: UseMutationOptions< APIPartner, APIError, AgencyDetailsPayload, TContext >
): UseMutationResult< APIPartner, APIError, AgencyDetailsPayload, TContext > {
	return useMutation< APIPartner, APIError, AgencyDetailsPayload, TContext >( {
		...options,
		mutationFn: createPartner,
	} );
}
