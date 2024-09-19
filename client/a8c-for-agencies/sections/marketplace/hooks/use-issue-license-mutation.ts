import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { APIError, APILicense } from 'calypso/state/partner-portal/types';

export interface MutationIssueLicenseVariables {
	product: string;
	quantity: number;
	isBundle?: boolean;
}

function mutationIssueLicense( {
	product,
	quantity,
	agencyId,
	isBundle = false,
}: MutationIssueLicenseVariables & { agencyId?: number } ): Promise< APILicense[] > {
	if ( ! agencyId ) {
		throw new Error( 'Agency ID is required to issue a license' );
	}
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/jetpack-licensing/licenses',
		body: { product, quantity, agency_id: agencyId, bundle: isBundle },
	} );
}

export default function useIssueLicenseMutation< TContext = unknown >(
	options?: UseMutationOptions< APILicense[], APIError, MutationIssueLicenseVariables, TContext >
): UseMutationResult< APILicense[], APIError, MutationIssueLicenseVariables, TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< APILicense[], APIError, MutationIssueLicenseVariables, TContext >( {
		...options,
		mutationFn: ( args ) => mutationIssueLicense( { ...args, agencyId } ),
	} );
}
