import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { Agency } from 'calypso/state/a8c-for-agencies/types';

export interface APIError {
	status: number;
	code: string | null;
	message: string;
	data?: {
		user_agencies?: Agency[];
		target_agency?: Agency;
	};
}

interface Params {
	agencyId: number;
	inviteId: number;
	secret: string;
}

interface APIResponse {
	success: boolean;
}

function activateMemberMutation( params: Params ): Promise< APIResponse > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ params.agencyId }/user-invites/${ params.inviteId }`,
		method: 'POST',
		body: params,
	} );
}

export default function useActivateMemberMutation< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, APIError, Params, TContext >
): UseMutationResult< APIResponse, APIError, Params, TContext > {
	return useMutation< APIResponse, APIError, Params, TContext >( {
		...options,
		mutationFn: activateMemberMutation,
	} );
}
