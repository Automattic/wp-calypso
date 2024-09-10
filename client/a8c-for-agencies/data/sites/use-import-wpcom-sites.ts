import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

interface APIError {}

interface APIResponse {
	success: boolean;
}

function importWPCOMSitesMutation(
	blogIds: number[],
	agencyId?: number
): Promise< APIResponse[] > {
	return Promise.all(
		blogIds.map( ( blogId ) => {
			return wpcom.req.post( {
				apiNamespace: 'wpcom/v2',
				path: `/agency/${ agencyId }/sites`,
				body: {
					blog_id: blogId,
				},
			} );
		} )
	);
}

export default function useImportWPCOMSitesMutation< TContext = unknown >(
	options?: UseMutationOptions< APIResponse[], APIError, number[], TContext >
): UseMutationResult< APIResponse[], APIError, number[], TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< APIResponse[], APIError, number[], TContext >( {
		...options,
		mutationFn: ( args ) => importWPCOMSitesMutation( args, agencyId ),
	} );
}
