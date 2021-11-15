/**
 * This function is deprecated. Do not use it for new code.
 *
 * Please use the properties you expect rather than running objects through
 * this function superstitiously. It will make type checking much easier.
 *
 * This function basically just camelCases specific properties, but it does so
 * for various definitions of the word "product". Some products are shopping
 * cart products, some are product endpoint products, some are products list
 * products, and some are even stranger things. As long as this function is
 * used, we cannot know what sorts of data we are using.
 *
 * @deprecated
 */
export function formatProduct( product ) {
	return {
		...product,
		product_slug: product.product_slug || product.productSlug,
		product_type: product.product_type || product.productType,
		included_domain_purchase_amount:
			product.included_domain_purchase_amount || product.includedDomainPurchaseAmount,
		is_domain_registration:
			product.is_domain_registration !== undefined
				? product.is_domain_registration
				: product.isDomainRegistration,
		free_trial: product.free_trial || product.freeTrial,
	};
}
