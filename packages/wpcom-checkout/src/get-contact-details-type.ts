import {
	isDomainRegistration,
	isDomainTransfer,
	isGoogleWorkspaceExtraLicence,
	isGoogleWorkspaceProductSlug,
	isGSuiteProductSlug,
} from '@automattic/calypso-products';
import { isWpComProductRenewal } from './is-wpcom-product-renewal';
import { doesPurchaseHaveFullCredits } from './transformations';
import type { ContactDetailsType } from './types';
import type { ResponseCart } from '@automattic/shopping-cart';

export function getContactDetailsType( responseCart: ResponseCart ): ContactDetailsType {
	const hasDomainRegistration = responseCart.products.some( isDomainRegistration );
	const hasTransferProduct = responseCart.products.some( isDomainTransfer );
	const hasDomainProduct = hasDomainRegistration || hasTransferProduct;
	const hasOnlyRenewals = responseCart.products.every(
		( item ) => isWpComProductRenewal( item ) || item.product_slug === 'wordpress-com-credits'
	);

	if ( hasDomainProduct && ! hasOnlyRenewals ) {
		return 'domain';
	}

	// Hides account information form if the user is only purchasing extra licenses for G Suite or Google Workspace
	const hasNewGSuite = responseCart.products.some( ( product ) => {
		if ( isGSuiteProductSlug( product.product_slug ) ) {
			return true;
		}

		return (
			isGoogleWorkspaceProductSlug( product.product_slug ) &&
			! isGoogleWorkspaceExtraLicence( product )
		);
	} );

	if ( hasNewGSuite && ! hasOnlyRenewals ) {
		return 'gsuite';
	}

	const isPurchaseFree = responseCart.total_cost_integer === 0;
	const isFullCredits = doesPurchaseHaveFullCredits( responseCart );
	const doesCartContainOnlyOneTimePurchases = responseCart.products.every(
		( product ) => product.is_one_time_purchase
	);
	const isCartForSite = responseCart.cart_key !== 'no-user' && responseCart.cart_key !== 'no-site';

	// Hide contact step entirely for free purchases (that are not free because
	// of credits) for carts that contain only one-time purchases. In that
	// situation, there's no need to collect tax information since we will not
	// be charging the user now or ever. However, we must still show the
	// contact step for logged-out carts because in those cases we need to
	// collect an email address that is part of the tax form.
	//
	// The backend has similar conditions which hide the credit card payment
	// method (for which we need tax info from the contact step) if the cart
	// has only one-time purchases.
	if ( isPurchaseFree && doesCartContainOnlyOneTimePurchases && ! isFullCredits && isCartForSite ) {
		return 'none';
	}

	return 'tax';
}
