import { useMutation, UseMutationResult } from '@tanstack/react-query';

interface APILicenseDownload {
	download_url: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const noop = ( _key: string ) => Promise.resolve( { download_url: 'test' } as APILicenseDownload );

/**
 * This is technically not a mutation but is used imperatively and is therefore more useful as a mutation than a query.
 */
export default function useLicenseDownloadUrlMutation< TVariables = null, TContext = unknown >(
	licenseKey: string
): UseMutationResult< APILicenseDownload, Error, TVariables, TContext > {
	return useMutation< APILicenseDownload, Error, TVariables, TContext >( {
		mutationFn: () => noop( licenseKey ), // Implement actual API call
	} );
}
