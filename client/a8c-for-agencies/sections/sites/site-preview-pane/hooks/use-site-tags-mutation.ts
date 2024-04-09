import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import SiteTag from 'calypso/client/a8c-for-agencies/types/site-tag';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { APIError } from 'calypso/state/partner-portal/types';

interface UpdateSiteTagsMutationOptions {
	siteId: number;
	siteTagsList: SiteTag[];
}

function mutationUpdateSiteTags( {
	agencyId,
	siteId,
	siteTagsList,
}: UpdateSiteTagsMutationOptions & { agencyId?: number } ): Promise< SiteTag[] > {
	if ( ! siteId ) {
		throw new Error( 'Site ID is required to update tags' );
	}

	return wpcom.req.put( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/sites/${ siteId }/tags`,
		body: siteTagsList,
	} );
}

export default function useUpdateSiteTagsMutation< TContext = unknown >(
	options?: UseMutationOptions< SiteTag[], APIError, UpdateSiteTagsMutationOptions, TContext >
): UseMutationResult< SiteTag[], APIError, UpdateSiteTagsMutationOptions, TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< SiteTag[], APIError, UpdateSiteTagsMutationOptions, TContext >( {
		...options,
		mutationFn: ( args ) => mutationUpdateSiteTags( { ...args, agencyId } ),
	} );
}
