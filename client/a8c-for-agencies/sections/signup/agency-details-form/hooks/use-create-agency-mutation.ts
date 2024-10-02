import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { APIError, Agency } from 'calypso/state/a8c-for-agencies/types';
import { AgencyDetailsPayload } from '../types';

function createAgency( details: AgencyDetailsPayload ): Promise< Agency > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/agency',
		body: {
			first_name: details.firstName,
			last_name: details.lastName,
			agency_name: details.agencyName,
			agency_url: details.agencyUrl,
			number_sites: details.managedSites,
			user_type: details.userType,
			services_offered: details.servicesOffered,
			products_offered: details.productsOffered,
			address_line1: details.line1,
			address_line2: details.line2,
			address_city: details.city,
			address_country: details.country,
			address_state: details.state,
			phone_number: details.phone?.phoneNumber ? details.phone?.phoneNumberFull : '',
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
