import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

interface APIError {
	status: number;
	code: string | null;
	message: string;
}

export interface cancelMemberInviteParams {
	id: number;
}

interface APIResponse {
	success: boolean;
}

function cancelMemberInviteMutation(
	params: cancelMemberInviteParams,
	agencyId?: number
): Promise< APIResponse > {
	if ( ! agencyId ) {
		throw new Error( 'Agency ID is required to assign a license' );
	}

	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/user-invites/${ params.id }`,
		method: 'DELETE',
	} );
}

export default function useCancelMemberInviteMutation< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, APIError, cancelMemberInviteParams, TContext >
): UseMutationResult< APIResponse, APIError, cancelMemberInviteParams, TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< APIResponse, APIError, cancelMemberInviteParams, TContext >( {
		...options,
		mutationFn: ( args ) => cancelMemberInviteMutation( args, agencyId ),
	} );
}
