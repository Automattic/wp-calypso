export function allowedProductAttributes( product ) {
	const {
		product_id,
		product_name,
		product_slug,
		is_domain_registration,
		term,
		bill_period,
	} = product;
	return {
		product_id,
		product_name,
		product_slug,
		is_domain_registration,
		term,
		bill_period,
	};
}
