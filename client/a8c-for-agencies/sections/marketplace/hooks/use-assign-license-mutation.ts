import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getCurrentAgencyUserId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { APILicense } from 'calypso/state/partner-portal/types';

interface MutationAssignLicenseVariables {
	licenseKey: string;
	selectedSite: number | boolean;
}

function mutationAssignLicense( {
	licenseKey,
	selectedSite,
	agencyId,
}: MutationAssignLicenseVariables & { agencyId: number } ): Promise< APILicense > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/jetpack-licensing/license/${ licenseKey }/site`,
		body: { site: selectedSite, agency_id: agencyId },
	} );
}

export default function useAssignLicenseMutation< TContext = unknown >(
	options?: UseMutationOptions< APILicense, Error, MutationAssignLicenseVariables, TContext >
): UseMutationResult< APILicense, Error, MutationAssignLicenseVariables, TContext > {
	const agencyId = useSelector( getCurrentAgencyUserId );

	return useMutation< APILicense, Error, MutationAssignLicenseVariables, TContext >( {
		...options,
		mutationFn: ( args ) => mutationAssignLicense( { ...args, agencyId } ),
	} );
}
