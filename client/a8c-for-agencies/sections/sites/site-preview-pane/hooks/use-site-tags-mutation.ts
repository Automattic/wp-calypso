import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

export interface SiteTags {
	id: number;
	slug: string;
	value: string;
}

export type SiteTagsList = SiteTags[];

function mutationIssueLicense(
	agencyID: number,
	siteID: number,
	siteTagsList: SiteTagsList & []
): Promise< SiteTags[] > {
	if ( ! siteID ) {
		throw new Error( 'Site ID is required to update tags' );
	}

	return wpcom.req.put( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyID }/sites/${ siteID }/tags`,
		body: siteTagsList,
	} );
}

export default function useIssueLicenseMutation< TContext = unknown >(
	options?: UseMutationOptions< APILicense, APIError, MutationIssueLicenseVariables, TContext >
): UseMutationResult< APILicense, APIError, MutationIssueLicenseVariables, TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< APILicense, APIError, MutationIssueLicenseVariables, TContext >( {
		...options,
		mutationFn: ( args ) => mutationIssueLicense( { ...args, agencyId } ),
	} );
}
