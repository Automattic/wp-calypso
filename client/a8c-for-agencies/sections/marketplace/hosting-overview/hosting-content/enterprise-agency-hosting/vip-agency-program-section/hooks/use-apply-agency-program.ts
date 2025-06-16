import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { APIError, Agency } from 'calypso/state/a8c-for-agencies/types';
import { AgencyProgramFormData } from '../types';

function applyAgencyProgram( details: AgencyProgramFormData ): Promise< Agency > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/agency/vip-program',
		body: {
			business_email: details.businessEmail,
			first_name: details.firstName,
			last_name: details.lastName,
			job_title: details.jobTitle,
			phone_number: details.phoneNumber,
			country: details.country,
			services_provided: details.servicesProvided,
			agency_website: details.agencyWebsite,
			agency_size: details.agencySize,
			agency_revenue: details.agencyRevenue,
			client_sites: details.clientSites,
			subscribe_to_newsletter: details.subscribeToNewsletter,
		},
	} );
}

export default function useApplyAgencyProgramMutation< TContext = unknown >(
	options?: UseMutationOptions< Agency, APIError, AgencyProgramFormData, TContext >
): UseMutationResult< Agency, APIError, AgencyProgramFormData, TContext > {
	return useMutation< Agency, APIError, AgencyProgramFormData, TContext >( {
		...options,
		mutationFn: applyAgencyProgram,
	} );
}
