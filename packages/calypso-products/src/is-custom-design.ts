export function isCustomDesign( product: { product_slug: string } ): boolean {
	return 'custom-design' === product.product_slug;
}
