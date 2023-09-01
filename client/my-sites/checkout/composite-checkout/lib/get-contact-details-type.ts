import {
	isAkismetProduct,
	isGoogleWorkspaceExtraLicence,
	isGoogleWorkspaceProductSlug,
	isGSuiteProductSlug,
} from '@automattic/calypso-products';
import { doesPurchaseHaveFullCredits } from '@automattic/wpcom-checkout';
import {
	hasDomainRegistration,
	hasTransferProduct,
	hasOnlyRenewalItems,
} from 'calypso/lib/cart-values/cart-items';
import type { ResponseCart } from '@automattic/shopping-cart';
import type { ContactDetailsType } from '@automattic/wpcom-checkout';

export default function getContactDetailsType( responseCart: ResponseCart ): ContactDetailsType {
	const hasDomainProduct =
		hasDomainRegistration( responseCart ) || hasTransferProduct( responseCart );
	const hasOnlyRenewals = hasOnlyRenewalItems( responseCart );

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
	const isAkismetPurchase = responseCart.products.some( ( product ) => {
		return isAkismetProduct( product );
	} );

	// Akismet free purchases still need contact information if logged out
	if ( isPurchaseFree && ! isAkismetPurchase && ! isFullCredits ) {
		return 'none';
	}

	return 'tax';
}
