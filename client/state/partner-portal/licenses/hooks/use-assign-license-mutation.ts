import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { APILicense } from 'calypso/state/partner-portal/types';

interface MutationAssignLicenseVariables {
	licenseKey: string;
	selectedSite: number | boolean;
}

function mutationAssignLicense( {
	licenseKey,
	selectedSite,
}: MutationAssignLicenseVariables ): Promise< APILicense > {
	return wpcomJpl.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/jetpack-licensing/license/${ licenseKey }/site`,
		body: { site: selectedSite },
	} );
}

export default function useAssignLicenseMutation< TContext = unknown >(
	options?: UseMutationOptions< APILicense, Error, MutationAssignLicenseVariables, TContext >
): UseMutationResult< APILicense, Error, MutationAssignLicenseVariables, TContext > {
	return useMutation< APILicense, Error, MutationAssignLicenseVariables, TContext >( {
		...options,
		mutationFn: mutationAssignLicense,
	} );
}
