import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export interface MutationSubmitPaymentInfoVariables {
	agencyId: number;
	referralId: number;
	secret: string;
}

interface APIResponse {
	status: number;
}

interface APIError {
	status: number;
	code: string | null;
	message: string;
}

function mutationSubmitPaymentInfo( {
	agencyId,
	referralId,
	secret,
}: MutationSubmitPaymentInfoVariables ): Promise< APIResponse > {
	if ( ! agencyId ) {
		throw new Error( 'Agency ID is required to submit payment info' );
	}
	if ( ! referralId ) {
		throw new Error( 'Referral ID is required to submit payment info' );
	}
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/agency-client/agency/${ agencyId }/referrals/${ referralId }`,
		body: {
			secret,
		},
	} );
}

export default function useSubmitPaymentInfoMutation< TContext = unknown >(
	options?: UseMutationOptions<
		APIResponse,
		APIError,
		MutationSubmitPaymentInfoVariables,
		TContext
	>
): UseMutationResult< APIResponse, APIError, MutationSubmitPaymentInfoVariables, TContext > {
	return useMutation< APIResponse, APIError, MutationSubmitPaymentInfoVariables, TContext >( {
		...options,
		mutationFn: mutationSubmitPaymentInfo,
	} );
}
