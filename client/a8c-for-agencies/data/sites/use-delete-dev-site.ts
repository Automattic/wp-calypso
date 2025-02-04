import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

interface APIResponse {
	success: boolean;
}

interface APIRequestArgs {
	agencyId: number;
	siteId: number;
}

function mutationDeleteDevSite( { siteId, agencyId }: APIRequestArgs ): Promise< APIResponse > {
	if ( ! agencyId ) {
		throw new Error( 'Agency ID is required to assign a license' );
	}

	return wpcom.req.post( {
		method: 'DELETE',
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/sites/${ siteId }/delete-dev-site`,
	} );
}

/**
 * Hook to remove a dev site from the agency dashboard, to revoke the dev license, and to delete the WPCOM site.
 */
export default function useDeleteDevSiteMutation( siteId: number, options?: UseMutationOptions ) {
	const agencyId = useSelector( getActiveAgencyId );
	if ( ! agencyId ) {
		throw new Error( 'Agency ID is required to delete a WPCOM dev site' );
	}

	return useMutation( {
		...options,
		mutationFn: () => mutationDeleteDevSite( { agencyId, siteId } ),
	} );
}
