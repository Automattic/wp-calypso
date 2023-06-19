import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { APILicense } from 'calypso/state/partner-portal/types';

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
	return useMutation< APILicense, Error, MutationRevokeLicenseVariables, TContext >( {
		...options,
		mutationFn: mutationRevokeLicense,
	} );
}
