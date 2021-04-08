/**
 * Internal dependencies
 */
import type { FormattedProduct, CamelCaseProduct } from './types';

export function formatProduct( product: FormattedProduct | CamelCaseProduct ): FormattedProduct {
	if ( isSnakeCaseProduct( product ) ) {
		return product;
	}
	return Object.assign( {}, product, {
		product_slug: product.productSlug,
		product_type: product.productType,
		included_domain_purchase_amount: product.includedDomainPurchaseAmount,
		is_domain_registration: product.isDomainRegistration,
	} );
}

function isSnakeCaseProduct( product: unknown ): product is FormattedProduct {
	return !! ( product as FormattedProduct ).product_slug;
}
