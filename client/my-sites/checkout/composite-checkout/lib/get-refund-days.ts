import {
	isDomainProduct,
	isDomainTransfer,
	isGoogleWorkspace,
	isGoogleWorkspaceMonthly,
	isMonthly,
	isPlan,
	isTitanMail,
	isTitanMailMonthly,
} from '@automattic/calypso-products';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

/**
 * Returns the length of the refund window for a single cart product.
 *
 * @param product The cart product
 * @returns The number of days in the product's refund window
 */
export default function getRefundDays( product: ResponseCartProduct ): number {
	if ( isDomainProduct( product ) || isDomainTransfer( product ) ) {
		return 4;
	}

	if ( isPlan( product ) ) {
		return isMonthly( product.product_slug ) ? 7 : 14;
	}

	if ( isGoogleWorkspace( product ) ) {
		return isGoogleWorkspaceMonthly( product ) ? 7 : 14;
	}

	if ( isTitanMail( product ) ) {
		return isTitanMailMonthly( product ) ? 7 : 14;
	}

	return 0;
}
