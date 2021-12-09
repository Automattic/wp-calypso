export function isBundled( product: { is_bundled: boolean } ): boolean {
	return !! product.is_bundled;
}
