import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { APIError, APIPartner, PartnerDetailsPayload } from 'calypso/state/partner-portal/types';

function createPartner( details: PartnerDetailsPayload ): Promise< APIPartner > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/jetpack-licensing/partner',
		body: {
			name: details.name,
			contact_person: details.contactPerson,
			company_website: details.companyWebsite,
			company_type: details.companyType,
			managed_sites: details.managedSites,
			city: details.city,
			line1: details.line1,
			line2: details.line2,
			country: details.country,
			postal_code: details.postalCode,
			state: details.state,
			tos: details.tos,
		},
	} );
}

export default function useCreatePartnerMutation< TContext = unknown >(
	options?: UseMutationOptions< APIPartner, APIError, PartnerDetailsPayload, TContext >
): UseMutationResult< APIPartner, APIError, PartnerDetailsPayload, TContext > {
	return useMutation< APIPartner, APIError, PartnerDetailsPayload, TContext >( {
		...options,
		mutationFn: createPartner,
	} );
}
