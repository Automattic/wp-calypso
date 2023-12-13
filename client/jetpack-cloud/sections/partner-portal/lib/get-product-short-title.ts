import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import getProductTitle from './get-product-title';
import getProductVariantShortTitle from './get-product-variant-short-title';

/**
 * Get the short version of the product title
 * @param product Product
 * @param removeVariant if we need to remove variant information
 * @returns Product title
 */
export default function getProductShortTitle(
	product: APIProductFamilyProduct,
	removeVariant: boolean = false
): string {
	const title = getProductTitle( product.name, removeVariant );

	if ( product.family_slug === 'jetpack-backup-storage' ) {
		return getProductVariantShortTitle( title );
	}

	return title.replaceAll( /(?:Woocommerce\s|[)(])/gi, '' );
}
