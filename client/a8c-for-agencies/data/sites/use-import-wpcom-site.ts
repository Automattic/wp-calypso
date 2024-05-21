import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

interface APIError {}

interface ImportWPCOMSiteParams {
	blog_id: number;
}

interface APIResponse {
	success: boolean;
}

function importWPCOMSiteMutation(
	params: ImportWPCOMSiteParams,
	agencyId?: number
): Promise< APIResponse > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/sites`,
		body: params,
	} );
}

export default function useImportWPCOMSiteMutation< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, APIError, ImportWPCOMSiteParams, TContext >
): UseMutationResult< APIResponse, APIError, ImportWPCOMSiteParams, TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< APIResponse, APIError, ImportWPCOMSiteParams, TContext >( {
		...options,
		mutationFn: ( args ) => importWPCOMSiteMutation( args, agencyId ),
	} );
}
