export function getDomain( product ) {
	const domainToBundle = product.extra?.domain_to_bundle;
	if ( domainToBundle ) {
		return domainToBundle;
	}

	return product.meta;
}
