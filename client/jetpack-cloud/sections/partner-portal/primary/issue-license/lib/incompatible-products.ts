import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import getProductInfo from '../../../lib/get-product-info';

/* Helper function to transform a Partner product slug to match User product slug for backward compatibility checking.
 * Tiered products information such as t1 and t2 are removed while some are replaced with higher tier.
 * For examples:
 *  - jetpack-backup-t1 is replaced with jetpack-backup.
 *  - jetpack-social-basic is replaced with jetpack_social_advanced.
 *
 * @param product
 * @returns product slug
 * */
function getProductSlug( product: APIProductFamilyProduct ) {
	if ( product.slug === 'jetpack-social-basic' ) {
		return 'jetpack_social_advanced';
	}

	if ( product.slug.startsWith( 'jetpack-backup-t' ) ) {
		return 'jetpack_backup';
	}

	if ( product.slug.startsWith( 'jetpack-security' ) ) {
		return 'jetpack_security';
	}

	return product.slug.replaceAll( /-/g, '_' );
}

/* Helper function to check if the selected product is included in the product.
 *
 * @param product
 * @param selectedProduct
 *
 * @returns boolean
 */
function isProductIncluded(
	product: APIProductFamilyProduct,
	selectedProduct: APIProductFamilyProduct
) {
	const productInfo = getProductInfo( product.slug );

	return productInfo?.productsIncluded
		?.map( ( slug ) => slug.replace( /_(monthly|yearly|t[0-9])/g, '' ) )
		.includes( getProductSlug( selectedProduct ) );
}

/* Return list of incompatible products based on the selected products.
 *
 * @param selectedProducts - list of selected products
 * @param products - list of all products
 *
 * @returns list of incompatible products slug
 */
export function getIncompatibleProducts(
	selectedProducts: APIProductFamilyProduct[],
	products: APIProductFamilyProduct[]
) {
	return products
		.filter( ( product ) => {
			return selectedProducts.some( ( selectedProduct ) => {
				const isSelectedProductIncluded = isProductIncluded( product, selectedProduct );
				const isIncludedInSelectedProduct = isProductIncluded( selectedProduct, product );
				const isSelectedProductOnSameFamily = product.family_slug === selectedProduct.family_slug;
				return (
					( isSelectedProductIncluded ||
						isIncludedInSelectedProduct ||
						isSelectedProductOnSameFamily ) &&
					product.slug !== selectedProduct.slug
				);
			} );
		} )
		.map( ( product ) => product.slug );
}

/* Check if the product is incompatible with the selected products.
 *
 * @param products
 * @param incompatibleProducts
 *
 * @returns boolean
 */
export function isIncompatibleProduct(
	products: APIProductFamilyProduct | APIProductFamilyProduct[],
	incompatibleProducts: string[]
) {
	if ( Array.isArray( products ) ) {
		return products.some( ( product ) => incompatibleProducts.includes( product.slug ) );
	}

	return incompatibleProducts.includes( products.slug );
}
