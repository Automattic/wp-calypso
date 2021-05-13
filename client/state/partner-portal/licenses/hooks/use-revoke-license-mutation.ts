/**
 * External dependencies
 */
import { useMutation, UseMutationOptions, UseMutationResult } from 'react-query';

/**
 * Internal dependencies
 */
import { APILicense } from 'calypso/state/partner-portal/types';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';

interface MutationRevokeLicenseVariables {
	licenseKey: string;
}

function mutationRevokeLicense( {
	licenseKey,
}: MutationRevokeLicenseVariables ): Promise< APILicense > {
	return wpcomJpl.req.post( {
		method: 'DELETE',
		apiNamespace: 'wpcom/v2',
		path: '/jetpack-licensing/license',
		body: { license_key: licenseKey },
	} );
}

export default function useRevokeLicenseMutation< TContext = unknown >(
	options?: UseMutationOptions< APILicense, Error, MutationRevokeLicenseVariables, TContext >
): UseMutationResult< APILicense, Error, MutationRevokeLicenseVariables, TContext > {
	return useMutation< APILicense, Error, MutationRevokeLicenseVariables, TContext >(
		mutationRevokeLicense,
		options
	);
}
