import { useMutation, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

interface APILicenseDownload {
	download_url: string;
}

/**
 * This is technically not a mutation but is used imperatively and is therefore more useful as a mutation than a query.
 */
export default function useLicenseDownloadUrlMutation< TVariables = null, TContext = unknown >(
	licenseKey: string
): UseMutationResult< APILicenseDownload, Error, TVariables, TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< APILicenseDownload, Error, TVariables, TContext >( {
		mutationFn: () =>
			wpcom.req.get(
				{
					apiNamespace: 'wpcom/v2',
					path: `/jetpack-licensing/license/${ licenseKey }/download`,
				},
				{
					agency_id: agencyId,
				}
			) as Promise< APILicenseDownload >,
	} );
}
