import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { APIError, Agency } from 'calypso/state/a8c-for-agencies/types';
import { ReferEnterpriseHostingFormData } from '../types';

function referEnterpriseHostingMutation(
	agencyId: number | undefined,
	details: ReferEnterpriseHostingFormData
): Promise< Agency > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/agency/vip/partner-opportunity',
		body: {
			agency_id: agencyId,
			company_name: details.companyName,
			address: details.address,
			country_code: details.country,
			state: details.state,
			city: details.city,
			zip: details.zip,
			first_name: details.firstName,
			last_name: details.lastName,
			title: details.title,
			phone: details.phone,
			email: details.email,
			website: details.website,
			opportunity_description: details.opportunityDescription,
		},
	} );
}

export default function useReferEnterpriseHostingMutation< TContext = unknown >(
	options?: UseMutationOptions< Agency, APIError, ReferEnterpriseHostingFormData, TContext >
): UseMutationResult< Agency, APIError, ReferEnterpriseHostingFormData, TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< Agency, APIError, ReferEnterpriseHostingFormData, TContext >( {
		...options,
		mutationFn: ( details ) => referEnterpriseHostingMutation( agencyId, details ),
	} );
}
