export function getDomain( product: {
	meta: string;
	extra?: { domain_to_bundle?: string };
} ): string {
	return product.extra?.domain_to_bundle ?? product.meta;
}
