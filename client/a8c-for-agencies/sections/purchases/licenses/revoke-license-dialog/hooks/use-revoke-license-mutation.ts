import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { APILicense } from 'calypso/state/partner-portal/types';

interface MutationRevokeLicenseVariables {
	licenseKey: string;
}

function mutationRevokeLicense( {
	licenseKey,
}: MutationRevokeLicenseVariables ): Promise< APILicense > {
	return wpcom.req.post( {
		method: 'DELETE',
		apiNamespace: 'wpcom/v2',
		path: '/agency/license',
		body: { license_key: licenseKey },
	} );
}

export default function useRevokeLicenseMutation< TContext = unknown >(
	options?: UseMutationOptions< APILicense, Error, MutationRevokeLicenseVariables, TContext >
): UseMutationResult< APILicense, Error, MutationRevokeLicenseVariables, TContext > {
	return useMutation< APILicense, Error, MutationRevokeLicenseVariables, TContext >( {
		...options,
		mutationFn: ( args ) => mutationRevokeLicense( { ...args } ),
	} );
}
