export function formatProduct( product ) {
	return Object.assign( {}, product, {
		product_slug: product.product_slug || product.productSlug,
		product_type: product.product_type || product.productType,
		included_domain_purchase_amount:
			product.included_domain_purchase_amount || product.includedDomainPurchaseAmount,
		is_domain_registration:
			product.is_domain_registration !== undefined
				? product.is_domain_registration
				: product.isDomainRegistration,
	} );
}
