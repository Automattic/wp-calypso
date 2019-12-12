export function getSaveErrorMessage( slug, productName, translate ) {
	switch ( slug ) {
		case 'product_invalid_sku':
			return translate(
				'There was a problem saving %(product)s. A product already exists with this SKU.',
				{
					args: { product: productName },
				}
			);
		default:
			return translate( 'There was a problem saving %(product)s. Please try again.', {
				args: { product: productName },
			} );
	}
}
