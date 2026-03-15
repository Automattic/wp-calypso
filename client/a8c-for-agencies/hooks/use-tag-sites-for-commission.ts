import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import SiteTag from 'calypso/a8c-for-agencies/types/site-tag';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { APIError } from 'calypso/state/partner-portal/types';

interface TagSitesForCommissionMutationOptions {
	siteIds: number[];
	tags: string[];
	migrationSourceHost: string;
}

function mutationTagSitesForCommission( {
	agencyId,
	siteIds,
	tags,
	migrationSourceHost,
}: TagSitesForCommissionMutationOptions & { agencyId: number | undefined } ): Promise<
	Record< number, SiteTag[] | APIError >
> {
	if ( ! agencyId ) {
		throw new Error( 'Agency ID is required to tag sites for commission' );
	}

	return wpcom.req.put( {
		method: 'PUT',
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/sites/tag-for-commission`,
		body: {
			tags,
			site_ids: siteIds,
			migration_source_host: migrationSourceHost,
		},
	} );
}

export default function useTagSitesForCommissionMutation< TContext = unknown >(
	options?: UseMutationOptions<
		Record< number, SiteTag[] | APIError >,
		APIError,
		TagSitesForCommissionMutationOptions,
		TContext
	>
): UseMutationResult<
	Record< number, SiteTag[] | APIError >,
	APIError,
	TagSitesForCommissionMutationOptions,
	TContext
> {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation<
		Record< number, SiteTag[] | APIError >,
		APIError,
		TagSitesForCommissionMutationOptions,
		TContext
	>( {
		...options,
		mutationFn: ( args ) => mutationTagSitesForCommission( { ...args, agencyId } ),
	} );
}
