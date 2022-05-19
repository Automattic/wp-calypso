import { useMutation, UseMutationOptions, UseMutationResult } from 'react-query';
import wpcom from 'calypso/lib/wp';
import { APIError, APIPartner } from 'calypso/state/partner-portal/types';

interface MutationUpdateCompanyDetailsVariables {
	name?: string;
	country?: string;
	city?: string;
	line1?: string;
	line2?: string;
	postal_code?: string;
	state?: string;
}

function mutationUpdateCompanyDetails(
	details: MutationUpdateCompanyDetailsVariables
): Promise< APIPartner > {
	return wpcom.req.put( {
		apiNamespace: 'wpcom/v2',
		path: '/jetpack-licensing/partner',
		body: details,
	} );
}

export default function useUpdateCompanyDetailsMutation< TContext = unknown >(
	options?: UseMutationOptions<
		APIPartner,
		APIError,
		MutationUpdateCompanyDetailsVariables,
		TContext
	>
): UseMutationResult< APIPartner, APIError, MutationUpdateCompanyDetailsVariables, TContext > {
	return useMutation< APIPartner, APIError, MutationUpdateCompanyDetailsVariables, TContext >(
		mutationUpdateCompanyDetails,
		options
	);
}
