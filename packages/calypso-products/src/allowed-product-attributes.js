export function allowedProductAttributes( product ) {
	return {
		product_id: product.product_id,
		product_name: product.product_name,
		product_slug: product.product_slug,
		is_domain_registration: product.is_domain_registration,
		term: product.term,
		bill_period: product.bill_period,
	};
}
