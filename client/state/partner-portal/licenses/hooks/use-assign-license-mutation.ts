import { useMutation, UseMutationOptions, UseMutationResult } from 'react-query';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { APILicenseAssign } from 'calypso/state/partner-portal/types';

interface MutationAssignLicenseVariables {
	licenseKey: string;
	selectedSite: any;
}

function mutationAssignLicense( {
	licenseKey,
	selectedSite,
}: MutationAssignLicenseVariables ): Promise< APILicenseAssign > {
	return wpcomJpl.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/jetpack-licensing/license/${ licenseKey }/site`,
		body: { site: selectedSite },
	} );
}

export default function useAssignLicenseMutation< TContext = unknown >(
	options?: UseMutationOptions< APILicenseAssign, Error, MutationAssignLicenseVariables, TContext >
): UseMutationResult< APILicenseAssign, Error, MutationAssignLicenseVariables, TContext > {
	return useMutation< APILicenseAssign, Error, MutationAssignLicenseVariables, TContext >(
		mutationAssignLicense,
		options
	);
}
