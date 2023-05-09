export function isRenewable( product: { isRenewable?: boolean } ): boolean {
	return Boolean( product.isRenewable );
}
