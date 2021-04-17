export function assertValidProduct( product ) {
	if ( ! product?.product_slug ) {
		throw new Error( 'Missing required attributes for ProductValue: [product_slug]' );
	}
}
