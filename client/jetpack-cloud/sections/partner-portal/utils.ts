import sortBy from 'lodash/sortBy';
import {
	LicenseFilter,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { APIProductFamily, APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import valueToEnum from './lib/value-to-enum';

/**
 * Noop which can be reused (e.g. in equality checks).
 *
 * @returns {void}
 */
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop() {}

export { default as getLicenseState } from './lib/get-license-state';
export { default as valueToEnum } from './lib/value-to-enum';

const internalFilterMap = {
	[ LicenseFilter.NotRevoked ]: '',
	[ LicenseFilter.Attached ]: 'assigned',
	[ LicenseFilter.Detached ]: 'unassigned',
} as { [ key: string ]: string };

const publicFilterMap = {
	[ internalFilterMap[ LicenseFilter.Attached ] ]: LicenseFilter.Attached,
	[ internalFilterMap[ LicenseFilter.Detached ] ]: LicenseFilter.Detached,
} as { [ key: string ]: LicenseFilter };

/**
 * Convert a public license filter to its internal representation.
 * Public filter differences are entirely cosmetic.
 *
 * @param {string} publicFilter Public filter value (e.g. "assigned").
 * @param {LicenseFilter} fallback Filter to return if publicFilter is invalid.
 * @returns {LicenseFilter} Internal filter.
 */
export function publicToInternalLicenseFilter(
	publicFilter: string,
	fallback: LicenseFilter
): LicenseFilter {
	return valueToEnum< LicenseFilter >(
		LicenseFilter,
		publicFilterMap[ publicFilter ] || publicFilter,
		fallback
	);
}

/**
 * Convert an internal license filter to its public representation.
 * Public filter differences are entirely cosmetic.
 *
 * @param {LicenseFilter} internalFilter Internal filter (e.g. LicenseFilter.Attached).
 * @returns {string} Public filter.
 */
export function internalToPublicLicenseFilter( internalFilter: LicenseFilter ): string {
	return internalFilterMap[ internalFilter ] || internalFilter;
}

const internalSortFieldMap = {
	[ LicenseSortField.AttachedAt ]: 'assigned_on',
} as { [ key: string ]: string };

const publicSortFieldMap = {
	[ internalSortFieldMap[ LicenseSortField.AttachedAt ] ]: LicenseSortField.AttachedAt,
} as { [ key: string ]: LicenseSortField };

/**
 * Convert a public license sort field to its internal representation.
 * Public sort field differences are entirely cosmetic.
 *
 * @param {string} publicSortField Public sort field value (e.g. "assigned_on").
 * @param {LicenseSortField} fallback Sort field to return if publicSortField is invalid.
 * @returns {LicenseSortField} Internal sort field.
 */
export function publicToInternalLicenseSortField(
	publicSortField: string,
	fallback: LicenseSortField
): LicenseSortField {
	return valueToEnum< LicenseSortField >(
		LicenseSortField,
		publicSortFieldMap[ publicSortField ] || publicSortField,
		fallback
	);
}

/**
 * Convert an internal license sort field to its public representation.
 * Public sort field differences are entirely cosmetic.
 *
 * @param {LicenseSortField} internalSortField Internal sort field (e.g. LicenseSortField.AttachedAt).
 * @returns {string} Public sort field.
 */
export function internalToPublicLicenseSortField( internalSortField: LicenseSortField ): string {
	return internalSortFieldMap[ internalSortField ] || internalSortField;
}

export { default as ensurePartnerPortalReturnUrl } from './lib/ensure-partner-portal-return-url';
export { default as formatApiPartner } from './lib/format-api-partner';
export { default as getProductTitle } from './lib/get-product-title';

export function selectProductOptions( families: APIProductFamily[] ): APIProductFamilyProduct[] {
	return families.flatMap( ( family ) => family.products );
}

export function selectAlphabeticallySortedProductOptions(
	families: APIProductFamily[]
): APIProductFamilyProduct[] {
	return sortBy( selectProductOptions( families ), ( product ) => product.name );
}

export { default as isJetpackBundle } from './lib/is-jetpack-bundle';
export { default as areLicenseKeysAssignableToMultisite } from './lib/are-license-keys-assignable-to-multisite';

export const LICENSE_INFO_MODAL_ID = 'show_license_modal';

/**
 * Provided a license key or a product slug, can we trust that the product is a WooCommerce product
 *
 * @param keyOrSlug string
 * @returns boolean True if WC product, false if not
 */
export function isWooCommerceProduct( keyOrSlug: string ) {
	return keyOrSlug.startsWith( 'woocommerce' );
}

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
