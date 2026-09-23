import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export interface APIError {
	status: number;
	code: string;
	message: string;
}

/**
 * The signed parameters Pressable put on the redirect URL, forwarded verbatim.
 * The signature covers the raw string values, so nothing is re-typed here.
 */
export interface PressableTitanCheckoutParams {
	agency_id: string;
	domain: string;
	quantity: string;
	signature: string;
	plan?: string;
	is_trial?: string;
}

export interface PressableTitanCheckoutResponse {
	checkout_url: string;
	domain: string;
	current_quantity: number;
	additional_quantity: number;
	target_quantity: number;
}

function preparePressableTitanCheckout(
	params: PressableTitanCheckoutParams
): Promise< PressableTitanCheckoutResponse > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/agency/pressable/titan-checkout',
		body: params,
	} );
}

/**
 * Ask WPCOM to verify Pressable's signed Titan checkout request, prepare the
 * cart for the agency owner, and return the checkout URL.
 */
export default function usePreparePressableTitanCheckoutMutation< TContext = unknown >(
	options?: UseMutationOptions<
		PressableTitanCheckoutResponse,
		APIError,
		PressableTitanCheckoutParams,
		TContext
	>
): UseMutationResult<
	PressableTitanCheckoutResponse,
	APIError,
	PressableTitanCheckoutParams,
	TContext
> {
	return useMutation<
		PressableTitanCheckoutResponse,
		APIError,
		PressableTitanCheckoutParams,
		TContext
	>( {
		...options,
		mutationFn: preparePressableTitanCheckout,
	} );
}
