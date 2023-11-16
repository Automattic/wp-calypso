import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { APIError, APIPartner, CompanyDetailsPayload } from 'calypso/state/partner-portal/types';

function updateCompanyDetails( details: CompanyDetailsPayload ): Promise< APIPartner > {
	return wpcom.req.put( {
		method: 'PUT',
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
		},
	} );
}

export default function useUpdateCompanyDetailsMutation< TContext = unknown >(
	options?: UseMutationOptions< APIPartner, APIError, CompanyDetailsPayload, TContext >
): UseMutationResult< APIPartner, APIError, CompanyDetailsPayload, TContext > {
	return useMutation< APIPartner, APIError, CompanyDetailsPayload, TContext >( {
		...options,
		mutationFn: updateCompanyDetails,
	} );
}
