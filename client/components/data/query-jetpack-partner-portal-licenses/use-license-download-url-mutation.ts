import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';

interface APILicenseDownload {
	download_url: string;
}

/**
 * This is technically not a mutation but is used imperatively and is therefore more useful as a mutation than a query.
 */
export default function useLicenseDownloadUrlMutation< TVariables = null, TContext = unknown >(
	licenseKey: string
): UseMutationResult< APILicenseDownload, Error, TVariables, TContext > {
	return useMutation< APILicenseDownload, Error, TVariables, TContext >( {
		mutationFn: () =>
			wpcomJpl.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/jetpack-licensing/license/${ licenseKey }/download`,
			} ) as Promise< APILicenseDownload >,
	} );
}
