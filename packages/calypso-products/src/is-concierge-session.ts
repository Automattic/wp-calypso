type WithSnakeCaseSlug = { product_slug: string };
type WithCamelCaseSlug = { productSlug: string };

export function isConciergeSession( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	if ( 'product_slug' in product ) {
		return 'concierge-session' === product.product_slug;
	}
	return 'concierge-session' === product.productSlug;
}
