import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { APIError, APILicense } from 'calypso/state/partner-portal/types';

export interface MutationIssueLicenseVariables {
	product: string;
}

function mutationIssueLicense( { product }: MutationIssueLicenseVariables ): Promise< APILicense > {
	return wpcomJpl.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/jetpack-licensing/license',
		body: { product },
	} );
}

export default function useIssueLicenseMutation< TContext = unknown >(
	options?: UseMutationOptions< APILicense, APIError, MutationIssueLicenseVariables, TContext >
): UseMutationResult< APILicense, APIError, MutationIssueLicenseVariables, TContext > {
	return useMutation< APILicense, APIError, MutationIssueLicenseVariables, TContext >( {
		...options,
		mutationFn: mutationIssueLicense,
	} );
}
