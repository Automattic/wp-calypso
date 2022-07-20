import { __, sprintf } from '@wordpress/i18n';
import { isDomainBundledWithPlan, isNextDomainFree } from 'calypso/lib/cart-values/cart-items';
import { getDomainPrice, getDomainProductSlug } from 'calypso/lib/domains';

export function getTransferPriceText( { cart, currencyCode, domain, productsList } ) {
	const productSlug = getDomainProductSlug( domain );
	const domainProductPrice = getDomainPrice( productSlug, productsList, currencyCode );

	if ( ! domainProductPrice ) {
		return;
	}

	if ( isNextDomainFree( cart ) || isDomainBundledWithPlan( cart, domain ) ) {
		/* translators: %s - the domain renewal price formatted in the user's currency */
		return sprintf( __( 'Renews at %s' ), domainProductPrice );
	}

	/* translators: %s - the domain price formatted in the user's currency */
	return sprintf( __( '%s/year' ), domainProductPrice );
}
