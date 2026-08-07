import { existingCardPrefix } from '../hooks/use-create-payment-methods/use-create-existing-cards';
import { existingPayPalPPCPPrefix } from '../hooks/use-create-payment-methods/use-create-existing-paypal-ppcp';
import type { PaymentMethod } from '@automattic/composite-checkout';
import type { ResponseCart } from '@automattic/shopping-cart';

/**
 * Decide which payment method should be selected when checkout first renders.
 *
 * Returning undefined leaves the choice to `selectFirstAvailablePaymentMethod`,
 * which picks whatever comes first in the available list.
 */
export function getInitiallySelectedPaymentMethodId(
	responseCart: ResponseCart,
	paymentMethods: Pick< PaymentMethod, 'id' >[]
): string | undefined {
	const storedDetailsId = responseCart.products.find( ( product ) => product.stored_details_id )
		?.stored_details_id;
	const isPurchaseFree = responseCart.total_cost_integer === 0;

	const preferredIds = [
		// A renewal should reuse whatever method is already on file.
		...( storedDetailsId
			? [
					`${ existingCardPrefix }${ storedDetailsId }`,
					`${ existingPayPalPPCPPrefix }${ storedDetailsId }`,
			  ]
			: [] ),
		// Nothing is owed, so fall back to the method that asks for no payment
		// details: the card form's required fields would otherwise block
		// submission on an order that costs nothing.
		...( isPurchaseFree ? [ 'free-purchase' ] : [] ),
	];

	return preferredIds.find( ( id ) => paymentMethods.some( ( method ) => method.id === id ) );
}
