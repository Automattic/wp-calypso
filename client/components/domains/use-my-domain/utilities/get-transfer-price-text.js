/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { getDomainPrice, getDomainProductSlug } from 'calypso/lib/domains';

export function getTransferPriceText( { currencyCode, domain, productsList } ) {
	const productSlug = getDomainProductSlug( domain );
	const domainProductPrice = getDomainPrice( productSlug, productsList, currencyCode );

	if ( ! domainProductPrice ) {
		return;
	}

	/* translators: %s - the domain price formatted in the user's currency */
	return sprintf( __( '%s/year' ), domainProductPrice );
}
