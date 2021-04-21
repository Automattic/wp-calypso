export function assertValidProduct( product ) {
	if ( ! Object.keys( product ).includes( 'product_slug' ) ) {
		throw new Error( 'Missing required attributes for ProductValue: [product_slug]' );
	}
}
