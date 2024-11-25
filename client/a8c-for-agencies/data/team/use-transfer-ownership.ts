import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

interface APIError {
	status: number;
	code: string | null;
	message: string;
}

export interface Params {
	id: number;
}

interface APIResponse {
	success: boolean;
}

function transferOwnershipMutation( params: Params, agencyId?: number ): Promise< APIResponse > {
	if ( ! agencyId ) {
		throw new Error( 'Agency ID is required to transfer ownership' );
	}

	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/transfer-ownership`,
		method: 'PUT',
		body: {
			new_owner_id: params.id,
		},
	} );
}

export default function useTransferOwnershipMutation< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, APIError, Params, TContext >
): UseMutationResult< APIResponse, APIError, Params, TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< APIResponse, APIError, Params, TContext >( {
		...options,
		mutationFn: ( args ) => transferOwnershipMutation( args, agencyId ),
	} );
}
