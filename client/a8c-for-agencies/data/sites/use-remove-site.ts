import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

export interface APIError {}

interface APIResponse {
	success: boolean;
}

interface Props {
	siteId: number;
	agencyId?: number;
}

function mutationRemoveSite( { siteId, agencyId }: Props ): Promise< APIResponse > {
	if ( ! agencyId ) {
		throw new Error( 'Agency ID is required to assign a license' );
	}

	return wpcom.req.post( {
		method: 'DELETE',
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/sites/${ siteId }`,
		body: { siteId, agency_id: agencyId },
	} );
}

export default function useRemoveSiteMutation< TContext = unknown >(
	options?: UseMutationOptions< APIError, Error, Props, TContext >
): UseMutationResult< APIError, Error, Props, TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< APIError, Error, Props, TContext >( {
		...options,
		mutationFn: ( args ) => mutationRemoveSite( { ...args, agencyId } ),
	} );
}
