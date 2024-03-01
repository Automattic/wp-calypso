import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { APILicense } from 'calypso/state/partner-portal/types';

interface MutationRevokeLicenseVariables {
	licenseKey: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const noop = ( _key: string ) => Promise.resolve( {} as APILicense );

function mutationRevokeLicense( {
	licenseKey,
}: MutationRevokeLicenseVariables ): Promise< APILicense > {
	return noop( licenseKey ); // Implement actual API call
}

export default function useRevokeLicenseMutation< TContext = unknown >(
	options?: UseMutationOptions< APILicense, Error, MutationRevokeLicenseVariables, TContext >
): UseMutationResult< APILicense, Error, MutationRevokeLicenseVariables, TContext > {
	return useMutation< APILicense, Error, MutationRevokeLicenseVariables, TContext >( {
		...options,
		mutationFn: mutationRevokeLicense,
	} );
}
