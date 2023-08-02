import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { APILicense } from 'calypso/state/partner-portal/types';

interface MutationUnassignLicenseVariables {
	licenseKey: string;
}

function mutationUnassignLicense( {
	licenseKey,
}: MutationUnassignLicenseVariables ): Promise< APILicense > {
	return wpcomJpl.req.post( {
		method: 'DELETE',
		apiNamespace: 'wpcom/v2',
		path: `/jetpack-licensing/license/${ licenseKey }/site`,
		body: { license_key: licenseKey },
	} );
}

export default function useUnassignLicenseMutation< TContext = unknown >(
	options?: UseMutationOptions< APILicense, Error, MutationUnassignLicenseVariables, TContext >
): UseMutationResult< APILicense, Error, MutationUnassignLicenseVariables, TContext > {
	return useMutation< APILicense, Error, MutationUnassignLicenseVariables, TContext >( {
		...options,
		mutationFn: mutationUnassignLicense,
	} );
}
