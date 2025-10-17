import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { APIError, Agency } from 'calypso/state/a8c-for-agencies/types';
import { ReferHostingFormDataPayload } from '../types';

function referHostingMutation(
	agencyId: number | undefined,
	formData: ReferHostingFormDataPayload,
	apiEndpoint: string
): Promise< Agency > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: apiEndpoint,
		body: {
			agency_id: agencyId,
			...formData,
		},
	} );
}

export default function useReferHostingMutation< TContext = unknown >(
	apiEndpoint: string,
	options?: UseMutationOptions< Agency, APIError, ReferHostingFormDataPayload, TContext >
): UseMutationResult< Agency, APIError, ReferHostingFormDataPayload, TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< Agency, APIError, ReferHostingFormDataPayload, TContext >( {
		...options,
		mutationFn: ( formData ) => referHostingMutation( agencyId, formData, apiEndpoint ),
	} );
}
