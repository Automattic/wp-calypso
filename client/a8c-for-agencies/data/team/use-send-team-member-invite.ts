import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { Agency } from 'calypso/state/a8c-for-agencies/types';

interface APIError {
	status: number;
	code: string | null;
	message: string;
	data?: any;
}

type InviteDetails = {
	username: string;
	message?: string;
};

// FIXME: We will update this mutation to match endpoint spec later once we have it ready.
function mutationSendTeamMemberInvite(
	agencyId: number | undefined,
	inviteDetails: InviteDetails
): Promise< Agency > {
	if ( ! agencyId ) {
		throw new Error( 'Agency ID is required to send team member invite' );
	}

	return wpcom.req.put( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/team/invite`,
		method: 'PUT',
		body: {
			username: inviteDetails.username,
			message: inviteDetails.message,
		},
	} );
}

export default function useSendTeamMemberInvite< TContext = unknown >(
	options?: UseMutationOptions< Agency, APIError, InviteDetails, TContext >
): UseMutationResult< Agency, APIError, InviteDetails, TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< Agency, APIError, InviteDetails, TContext >( {
		...options,
		mutationFn: ( inviteDetails ) => mutationSendTeamMemberInvite( agencyId, inviteDetails ),
	} );
}
