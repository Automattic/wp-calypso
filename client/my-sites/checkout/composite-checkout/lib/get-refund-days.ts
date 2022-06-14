import {
	isChargeback,
	isDomainProduct,
	isDomainRedemption,
	isDomainTransfer,
	isGoogleWorkspace,
	isGoogleWorkspaceExtraLicence,
	isMonthlyProduct,
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

	if ( isGoogleWorkspace( product ) && isGoogleWorkspaceExtraLicence( product ) ) {
		return 0;
	}

	// These are fees, and therefore not refundable.
	if ( isChargeback( product ) || isDomainRedemption( product ) ) {
		return 0;
	}

	return isMonthlyProduct( product ) ? 7 : 14;
}
