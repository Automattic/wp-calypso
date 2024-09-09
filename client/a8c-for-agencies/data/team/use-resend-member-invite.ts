import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

interface APIError {
	status: number;
	code: string | null;
	message: string;
}

export interface resendMemberInviteParams {
	id: number;
}

interface APIResponse {
	success: boolean;
}

function resendMemberInviteMutation(
	params: resendMemberInviteParams,
	agencyId?: number
): Promise< APIResponse > {
	if ( ! agencyId ) {
		throw new Error( 'Agency ID is required to assign a license' );
	}

	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/user-invites/${ params.id }/resend`,
		method: 'POST',
	} );
}

export default function useResendMemberInviteMutation< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, APIError, resendMemberInviteParams, TContext >
): UseMutationResult< APIResponse, APIError, resendMemberInviteParams, TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< APIResponse, APIError, resendMemberInviteParams, TContext >( {
		...options,
		mutationFn: ( args ) => resendMemberInviteMutation( args, agencyId ),
	} );
}
