import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { APILicense } from 'calypso/state/partner-portal/types';

interface MutationRevokeLicenseVariables {
	licenseKey: string;
	agencyId?: number;
}

function mutationRevokeLicense( {
	licenseKey,
	agencyId,
}: MutationRevokeLicenseVariables ): Promise< APILicense > {
	if ( ! agencyId ) {
		throw new Error( 'Agency ID is required to assign a license' );
	}
	return wpcom.req.post( {
		method: 'DELETE',
		apiNamespace: 'wpcom/v2',
		path: '/jetpack-licensing/license',
		body: { license_key: licenseKey, agency_id: agencyId },
	} );
}

export default function useRevokeLicenseMutation< TContext = unknown >(
	options?: UseMutationOptions< APILicense, Error, MutationRevokeLicenseVariables, TContext >
): UseMutationResult< APILicense, Error, MutationRevokeLicenseVariables, TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< APILicense, Error, MutationRevokeLicenseVariables, TContext >( {
		...options,
		mutationFn: ( args ) => mutationRevokeLicense( { ...args, agencyId } ),
	} );
}
