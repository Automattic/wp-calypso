/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { isDomainBundledWithPlan, isNextDomainFree } from 'calypso/lib/cart-values/cart-items';
import {
	getDomainPrice,
	getDomainProductSlug,
	getDomainTransferSalePrice,
} from 'calypso/lib/domains';

export function getTransferPriceText( { cart, currencyCode, domain, productsList } ) {
	const productSlug = getDomainProductSlug( domain );
	const domainProductPrice = getDomainPrice( productSlug, productsList, currencyCode );

	if (
		domainProductPrice &&
		( isNextDomainFree( cart ) ||
			isDomainBundledWithPlan( cart, domain ) ||
			! getDomainTransferSalePrice( productSlug, productsList, currencyCode ) )
	) {
		/* translators: %s - the domain renewal price formatted in the user's currency */
		return sprintf( __( 'Renews at %s' ), domainProductPrice );
	}

	if ( domainProductPrice ) {
		/* translators: %s - the domain price formatted in the user's currency */
		return sprintf( __( '%s/year' ), domainProductPrice );
	}
}
