export function isFreeWordPressComDomain( product: { is_free?: boolean } ): boolean {
	return product.is_free === true;
}
