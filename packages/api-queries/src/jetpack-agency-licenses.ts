import {
	assignJetpackLicenseToSite,
	fetchJetpackLicenseCounts,
	fetchJetpackLicenseDownloadUrl,
	fetchJetpackLicenses,
	issueJetpackLicenses,
	revokeJetpackLicense,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { agencySitesQueryKey } from './jetpack-agency-sites';
import { queryClient } from './query-client';
import type { FetchJetpackLicensesOptions, IssueJetpackLicensesInput } from '@automattic/api-core';

export const jetpackAgencyLicensesQuery = (
	agencyId: number,
	options: FetchJetpackLicensesOptions
) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'jetpack-agency-licenses', options ],
		queryFn: () => fetchJetpackLicenses( agencyId, options ),
	} );

export const jetpackAgencyLicenseCountsQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'jetpack-agency-licenses', 'counts' ],
		queryFn: () => fetchJetpackLicenseCounts( agencyId ),
	} );

function invalidateAgencyLicenses( agencyId: number ) {
	queryClient.invalidateQueries( {
		queryKey: [ 'agency', agencyId, 'jetpack-agency-licenses' ],
	} );
}

export const jetpackAgencyLicensesIssueMutation = ( agencyId: number ) =>
	mutationOptions( {
		meta: { statId: 'agcy-license-issue' },
		mutationFn: ( input: IssueJetpackLicensesInput ) => issueJetpackLicenses( agencyId, input ),
		onSuccess: () => invalidateAgencyLicenses( agencyId ),
	} );

export const jetpackAgencyLicenseAssignMutation = ( agencyId: number ) =>
	mutationOptions( {
		meta: { statId: 'agcy-license-assign' },
		mutationFn: ( { licenseKey, siteId }: { licenseKey: string; siteId: number } ) =>
			assignJetpackLicenseToSite( agencyId, licenseKey, siteId ),
		// Assigning or revoking also changes which products the site has.
		onSuccess: () => {
			invalidateAgencyLicenses( agencyId );
			queryClient.invalidateQueries( { queryKey: agencySitesQueryKey } );
		},
	} );

export const jetpackAgencyLicenseRevokeMutation = ( agencyId: number ) =>
	mutationOptions( {
		meta: { statId: 'agcy-license-revoke' },
		mutationFn: ( licenseKey: string ) => revokeJetpackLicense( licenseKey ),
		onSuccess: () => {
			invalidateAgencyLicenses( agencyId );
			queryClient.invalidateQueries( { queryKey: agencySitesQueryKey } );
		},
	} );

// Technically a read, but exposed as a mutation because the download URL is
// requested imperatively (on click) and should never be cached.
export const jetpackAgencyLicenseDownloadUrlMutation = ( agencyId: number ) =>
	mutationOptions( {
		meta: { statId: 'agcy-license-dl-url-fetch' },
		mutationFn: ( licenseKey: string ) => fetchJetpackLicenseDownloadUrl( agencyId, licenseKey ),
	} );
