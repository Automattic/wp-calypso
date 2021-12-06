export function isCredits( product: { product_slug: string } ): boolean {
	return 'wordpress-com-credits' === product.product_slug;
}
