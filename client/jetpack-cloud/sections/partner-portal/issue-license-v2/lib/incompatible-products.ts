import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import getProductInfo from '../../lib/get-product-info';

/* Helper function to get the product slug. Some of lower tier products is replaced with higher tier products.
 * For example, jetpack-social-basic is replaced with jetpack-social-advanced.
 *
 * @param product
 * @returns product slug
 * */
function getProductSlug( product: APIProductFamilyProduct ) {
	if ( product.slug === 'jetpack-social-basic' ) {
		return 'jetpack-social-advanced';
	}

	if ( product.slug.startsWith( 'jetpack-backup' ) ) {
		return 'jetpack-backup-t2';
	}

	if ( product.slug.startsWith( 'jetpack-security' ) ) {
		return 'jetpack-security-t2';
	}

	return product.slug;
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
		?.map( ( slug ) => slug.replace( /_(monthly|yearly)$/, '' ) )
		.includes( getProductSlug( selectedProduct ).replaceAll( /-/g, '_' ) );
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
