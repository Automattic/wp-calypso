import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

interface APIError {
	status: number;
	code: string | null;
	message: string;
}

export interface ArchiveReferralParams {
	id: number;
}

interface APIResponse {
	success: boolean;
}

function archiveReferralMutation(
	params: ArchiveReferralParams,
	agencyId?: number
): Promise< APIResponse > {
	if ( ! agencyId ) {
		throw new Error( 'Agency ID is required to archive a referral' );
	}

	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/referrals/${ params.id }/archive`,
		method: 'PUT',
	} );
}

export default function useArchiveReferralMutation< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, APIError, ArchiveReferralParams, TContext >
): UseMutationResult< APIResponse, APIError, ArchiveReferralParams, TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< APIResponse, APIError, ArchiveReferralParams, TContext >( {
		...options,
		mutationFn: ( args ) => archiveReferralMutation( args, agencyId ),
	} );
}
