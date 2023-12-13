import getProductTitle from './get-product-title';
import getProductVariantShortTitle from './get-product-variant-short-title';

/**
 * Get the short version of the product title
 * @param product Product
 * @param removeVariant if we need to remove variant information
 * @returns Product title
 */
export default function getProductShortTitle(
	product: string,
	removeVariant: boolean = false
): string {
	const title = getProductTitle( product, removeVariant );

	if ( title.startsWith( 'VaultPress Backup Add-on' ) ) {
		return getProductVariantShortTitle( title );
	}

	return title.replaceAll( /(?:Woocommerce\s|[)(])/gi, '' );
}
