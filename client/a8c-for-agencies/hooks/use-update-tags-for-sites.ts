import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import SiteTag from 'calypso/a8c-for-agencies/types/site-tag';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { APIError } from 'calypso/state/partner-portal/types';

interface UpdateTagsForSitesMutationOptions {
	siteIds: number[];
	tags: string[];
}

function mutationUpdateSiteTags( {
	agencyId,
	siteIds,
	tags,
}: UpdateTagsForSitesMutationOptions & { agencyId: number | undefined } ): Promise< SiteTag[] > {
	if ( ! agencyId ) {
		throw new Error( 'Agency ID is required to update the tags' );
	}

	return wpcom.req.put( {
		method: 'PUT',
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/sites/tags`,
		body: {
			tags,
			site_ids: siteIds,
		},
	} );
}

export default function useUpdateTagsForSitesMutation< TContext = unknown >(
	options?: UseMutationOptions< SiteTag[], APIError, UpdateTagsForSitesMutationOptions, TContext >
): UseMutationResult< SiteTag[], APIError, UpdateTagsForSitesMutationOptions, TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< SiteTag[], APIError, UpdateTagsForSitesMutationOptions, TContext >( {
		...options,
		mutationFn: ( args ) => mutationUpdateSiteTags( { ...args, agencyId } ),
	} );
}
