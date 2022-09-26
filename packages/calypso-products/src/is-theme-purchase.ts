export function isThemePurchase( purchase: { productType: string } ): boolean {
	return 'theme' === purchase.productType;
}
