import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { ReferralAPIResponse } from '../../referrals/types';

export interface MutationRequestClientPaymentVariables {
	client_email: string;
	client_message: string;
	product_ids: string;
	licenses?: {
		product_id: number;
		license_id: number;
	}[];
}

interface APIError {
	status: number;
	code: string | null;
	message: string;
}

function mutationRequestClientPayment( {
	client_email,
	client_message,
	product_ids,
	agencyId,
	licenses,
}: MutationRequestClientPaymentVariables & { agencyId?: number } ): Promise< ReferralAPIResponse > {
	if ( ! agencyId ) {
		throw new Error( 'Agency ID is required request a client payment' );
	}
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/referrals`,
		body: { client_email, client_message, product_ids, licenses },
	} );
}

export default function useRequestClientPaymentMutation< TContext = unknown >(
	options?: UseMutationOptions<
		ReferralAPIResponse,
		APIError,
		MutationRequestClientPaymentVariables,
		TContext
	>
): UseMutationResult<
	ReferralAPIResponse,
	APIError,
	MutationRequestClientPaymentVariables,
	TContext
> {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation<
		ReferralAPIResponse,
		APIError,
		MutationRequestClientPaymentVariables,
		TContext
	>( {
		...options,
		mutationFn: ( args ) => mutationRequestClientPayment( { ...args, agencyId } ),
	} );
}
