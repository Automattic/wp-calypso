export function getUnformattedDomainPrice( slug, productsList ) {
	let price = productsList?.[ slug ]?.cost ?? null;

	if ( price ) {
		price += productsList?.domain_map?.cost ?? 0;
	}

	return price;
}
