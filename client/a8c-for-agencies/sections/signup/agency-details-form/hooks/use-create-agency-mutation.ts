import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { APIError, Agency } from 'calypso/state/a8c-for-agencies/types';
import { AgencyDetailsPayload } from '../types';

function createAgency( details: AgencyDetailsPayload ): Promise< Agency > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/agency',
		body: {
			agency_name: details.agencyName,
			agency_url: details.agencyUrl,
			number_sites: details.managedSites,
			services_offered: details.servicesOffered,
			address_line1: details.line1,
			address_line2: details.line2,
			address_city: details.city,
			address_country: details.country,
			address_state: details.state,
			address_postal_code: details.postalCode,
			referral_status: details.referer,
		},
	} );
}

export default function useCreateAgencyMutation< TContext = unknown >(
	options?: UseMutationOptions< Agency, APIError, AgencyDetailsPayload, TContext >
): UseMutationResult< Agency, APIError, AgencyDetailsPayload, TContext > {
	return useMutation< Agency, APIError, AgencyDetailsPayload, TContext >( {
		...options,
		mutationFn: createAgency,
	} );
}
