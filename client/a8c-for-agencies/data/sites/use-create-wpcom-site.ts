import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

export interface APIError {}

export interface CreateSiteParams {
	id: number;
}

interface APIResponse {
	success: boolean;
}

function createWPCOMSiteMutation(
	params: CreateSiteParams,
	agencyId?: number
): Promise< APIResponse > {
	if ( ! agencyId ) {
		throw new Error( 'Agency ID is required to assign a license' );
	}

	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/sites/${ params.id }/provision`,
		body: params,
	} );
}

export default function useCreateWPCOMSiteMutation< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, APIError, CreateSiteParams, TContext >
): UseMutationResult< APIResponse, APIError, CreateSiteParams, TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< APIResponse, APIError, CreateSiteParams, TContext >( {
		...options,
		mutationFn: ( args ) => createWPCOMSiteMutation( args, agencyId ),
	} );
}
