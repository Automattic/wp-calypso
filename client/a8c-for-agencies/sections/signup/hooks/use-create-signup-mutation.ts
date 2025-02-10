import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { APIError, Agency } from 'calypso/state/a8c-for-agencies/types';
import { AgencyDetailsSignupPayload } from '../types';

function createSignup( details: AgencyDetailsSignupPayload ): Promise< Agency > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/agency/signup',
		body: {
			first_name: details.firstName,
			last_name: details.lastName,
			email: details.email,
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
			address_postal_code: details.postalCode,
			phone_number: details.phoneNumber ?? '',
			referral_status: details.referer,
			top_partnering_goal: details.topPartneringGoal,
			top_yearly_goal: details.topYearlyGoal,
			work_with_clients:
				details.workWithClients === 'other'
					? details.workWithClientsOther
					: details.workWithClients,
			approach_and_challenges: details.approachAndChallenges,
		},
	} );
}

export default function useCreateSignupMutation< TContext = unknown >(
	options?: UseMutationOptions< Agency, APIError, AgencyDetailsSignupPayload, TContext >
): UseMutationResult< Agency, APIError, AgencyDetailsSignupPayload, TContext > {
	return useMutation< Agency, APIError, AgencyDetailsSignupPayload, TContext >( {
		...options,
		mutationFn: createSignup,
	} );
}
