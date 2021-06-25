/**
 * External dependencies
 */
import { useMutation, UseMutationOptions, UseMutationResult } from 'react-query';

/**
 * Internal dependencies
 */
import { APILicense } from 'calypso/state/partner-portal/types';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';

interface MutationIssueLicenseVariables {
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
	options?: UseMutationOptions< APILicense, Error, MutationIssueLicenseVariables, TContext >
): UseMutationResult< APILicense, Error, MutationIssueLicenseVariables, TContext > {
	return useMutation< APILicense, Error, MutationIssueLicenseVariables, TContext >(
		mutationIssueLicense,
		options
	);
}
