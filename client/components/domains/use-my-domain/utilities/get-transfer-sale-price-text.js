/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { isDomainBundledWithPlan, isNextDomainFree } from 'calypso/lib/cart-values/cart-items';
import { getDomainProductSlug, getDomainTransferSalePrice } from 'calypso/lib/domains';

export function getTransferSalePriceText( { cart, currencyCode, domain, productsList } ) {
	const productSlug = getDomainProductSlug( domain );
	const domainProductSalePrice = getDomainTransferSalePrice(
		productSlug,
		productsList,
		currencyCode
	);

	if (
		! domainProductSalePrice ||
		isNextDomainFree( cart ) ||
		isDomainBundledWithPlan( cart, domain )
	) {
		return;
	}

	/* translators: %s is the cost of the domain transfer formatted in the user's currency. */
	return sprintf( __( '%s for the first year' ), domainProductSalePrice );
}
