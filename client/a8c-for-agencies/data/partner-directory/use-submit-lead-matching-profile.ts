import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import {
	AgencyLeadMatchingProfile,
	AgencyLeadMatchingResponse,
} from 'calypso/a8c-for-agencies/sections/partner-directory/types';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { APIError } from 'calypso/state/a8c-for-agencies/types';

function mutationSubmitLeadMatchingProfile(
	agencyId: number | undefined,
	profile: AgencyLeadMatchingProfile
): Promise< AgencyLeadMatchingResponse > {
	if ( ! agencyId ) {
		throw new Error( 'Agency ID is required to submit lead matching settings' );
	}

	return wpcom.req.put( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/lead-matching`,
		method: 'PUT',
		body: profile,
	} );
}

export default function useSubmitLeadMatchingProfileMutation< TContext = unknown >(
	options?: UseMutationOptions<
		AgencyLeadMatchingResponse,
		APIError,
		AgencyLeadMatchingProfile,
		TContext
	>
): UseMutationResult< AgencyLeadMatchingResponse, APIError, AgencyLeadMatchingProfile, TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< AgencyLeadMatchingResponse, APIError, AgencyLeadMatchingProfile, TContext >( {
		...options,
		mutationFn: ( profile ) => mutationSubmitLeadMatchingProfile( agencyId, profile ),
	} );
}
