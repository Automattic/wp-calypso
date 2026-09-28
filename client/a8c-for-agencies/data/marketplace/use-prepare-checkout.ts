import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { PreparedCheckoutRequest } from 'calypso/a8c-for-agencies/sections/marketplace/lib/prepared-checkout/get-prepared-checkout-request';

export interface PreparedCheckoutError {
	status: number;
	code: string;
	message: string;
}

export interface PreparedCheckoutProduct {
	product_id: number;
	quantity: number;
}

/**
 * The generic response every prepared-checkout endpoint returns. The checkout
 * page loads `cart_key` and requires the cart to contain exactly `products`.
 * `details` is source-specific context (logging, later display).
 */
export interface PreparedCheckoutResponse {
	cart_key: 'no-site';
	products: PreparedCheckoutProduct[];
	details: Record< string, unknown >;
}

function prepareCheckout( request: PreparedCheckoutRequest ): Promise< PreparedCheckoutResponse > {
	// The params are forwarded exactly as they appeared on the URL: the source's
	// signature covers the raw values, so nothing is re-typed or defaulted here.
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: request.source.endpoint,
		body: request.params,
	} );
}

/**
 * Ask a registered prepared-checkout source's wpcom endpoint to verify the
 * signed request and save the buyer's `no-site` cart.
 */
export default function usePrepareCheckoutMutation< TContext = unknown >(
	options?: UseMutationOptions<
		PreparedCheckoutResponse,
		PreparedCheckoutError,
		PreparedCheckoutRequest,
		TContext
	>
): UseMutationResult<
	PreparedCheckoutResponse,
	PreparedCheckoutError,
	PreparedCheckoutRequest,
	TContext
> {
	return useMutation( {
		...options,
		mutationFn: prepareCheckout,
	} );
}
