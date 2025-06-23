import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { APIError, Agency } from 'calypso/state/a8c-for-agencies/types';
import { ReferEnterpriseHostingFormData } from '../types';

function referEnterpriseHostingMutation(
	details: ReferEnterpriseHostingFormData
): Promise< Agency > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/agency/vip-program',
		body: {
			company_name: details.companyName,
			address: details.address,
			country_code: details.countryCode,
			city: details.city,
			zip: details.zip,
			first_name: details.firstName,
			last_name: details.lastName,
			title: details.title,
			phone: details.phone,
			email: details.email,
			website: details.website,
			opportunity_description: details.opportunityDescription,
			lead_type: details.leadType,
		},
	} );
}

export default function useReferEnterpriseHostingMutation< TContext = unknown >(
	options?: UseMutationOptions< Agency, APIError, ReferEnterpriseHostingFormData, TContext >
): UseMutationResult< Agency, APIError, ReferEnterpriseHostingFormData, TContext > {
	return useMutation< Agency, APIError, ReferEnterpriseHostingFormData, TContext >( {
		...options,
		mutationFn: referEnterpriseHostingMutation,
	} );
}
