import { useMutation, UseMutationOptions, UseMutationResult } from 'react-query';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { APILicenseAttach } from 'calypso/state/partner-portal/types';

interface MutationAttachLicenseVariables {
	licenseKey: string;
	selectedSite: any;
}

function mutationAttachLicense( {
	licenseKey,
	selectedSite,
}: MutationAttachLicenseVariables ): Promise< APILicense > {
	return wpcomJpl.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/jetpack-licensing/license/${ licenseKey }/site`,
		body: { site: selectedSite },
	} );
}

export default function useAttachLicenseMutation< TContext = unknown >(
	options?: UseMutationOptions< APILicenseAttach, Error, MutationAttachLicenseVariables, TContext >
): UseMutationResult< APILicenseAttach, Error, MutationAttachLicenseVariables, TContext > {
	return useMutation< APILicenseAttach, Error, MutationAttachLicenseVariables, TContext >(
		mutationAttachLicense,
		options
	);
}
