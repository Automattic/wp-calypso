/**
 * Internal dependencies
 */
import {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
	GOOGLE_WORKSPACE_PRODUCT_TYPE,
	GSUITE_BASIC_SLUG,
	GSUITE_PRODUCT_TYPE,
} from 'calypso/lib/gsuite/constants';

/**
 * Retrieves the product slug from the specified product type.
 *
 * @param {string} productType - type of the product
 * @returns {string} the corresponding product slug
 */
export function getProductSlug( productType ) {
	if ( productType === GOOGLE_WORKSPACE_PRODUCT_TYPE ) {
		return GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY;
	}

	return GSUITE_BASIC_SLUG;
}

/**
 * Retrieves the product type to use as slug in urls for the specified product slug.
 *
 * @param {string} productSlug - slug of the product
 * @returns {string} the corresponding product type
 * @see emailManagementAddGSuiteUsers() in client/my-sites/email/paths.js
 * @see emailManagementNewGSuiteAccount() in client/my-sites/email/paths.js
 */
export function getProductType( productSlug ) {
	if ( productSlug === GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY ) {
		return GOOGLE_WORKSPACE_PRODUCT_TYPE;
	}

	return GSUITE_PRODUCT_TYPE;
}
