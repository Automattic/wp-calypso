export { noop, LICENSE_INFO_MODAL_ID } from './lib/constants';
export { default as getLicenseState } from './lib/get-license-state';
export { default as valueToEnum } from './lib/value-to-enum';
export {
	publicToInternalLicenseFilter,
	internalToPublicLicenseFilter,
} from './lib/license-filters';
export {
	publicToInternalLicenseSortField,
	internalToPublicLicenseSortField,
} from './lib/license-sorters';
export { default as ensurePartnerPortalReturnUrl } from './lib/ensure-partner-portal-return-url';
export { default as formatApiPartner } from './lib/format-api-partner';
export { default as getProductTitle } from './lib/get-product-title';
export { default as selectAlphabeticallySortedProductOptions } from './lib/select-alphabetically-sorted-product-options';
export { default as isJetpackBundle } from './lib/is-jetpack-bundle';
export { default as isWooCommerceProduct } from './lib/is-woocommerce-product';
export { default as areLicenseKeysAssignableToMultisite } from './lib/are-license-keys-assignable-to-multisite';

/**
 * Provided a license key or a product slug, can we trust that the product is a WordPress.com hosting product
 *
 * @param keyOrSlug string
 * @returns boolean True if wpcom hosting product, false if not
 */
export function isWpcomHostingProduct( keyOrSlug: string ) {
	return keyOrSlug.startsWith( 'wpcom-hosting' );
}

/**
 * Provided a license key, return the product slug
 *
 * @param licenseKey string
 * @returns string Product slug
 */
export function getProductSlugFromKey( licenseKey: string ) {
	return licenseKey.split( '_' )[ 0 ];
}
