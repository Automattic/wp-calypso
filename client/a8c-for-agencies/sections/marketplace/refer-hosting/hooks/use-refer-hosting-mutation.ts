import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { APIError, Agency } from 'calypso/state/a8c-for-agencies/types';
import { ReferHostingFormDataPayload, ReferralDestinationBU } from '../types';

function referHostingMutation(
	agencyId: number | undefined,
	formData: ReferHostingFormDataPayload,
	type: ReferralDestinationBU
): Promise< Agency > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/agency/referral-form',
		body: {
			agency_id: agencyId,
			destination_bu: type,
			...formData,
		},
	} );
}

export default function useReferHostingMutation< TContext = unknown >(
	type: ReferralDestinationBU,
	options?: UseMutationOptions< Agency, APIError, ReferHostingFormDataPayload, TContext >
): UseMutationResult< Agency, APIError, ReferHostingFormDataPayload, TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< Agency, APIError, ReferHostingFormDataPayload, TContext >( {
		...options,
		mutationFn: ( formData ) => referHostingMutation( agencyId, formData, type ),
	} );
}
