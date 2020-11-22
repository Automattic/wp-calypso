/**
 * Internal dependencies
 */
import {
	GSUITE_BASIC_SLUG,
	GSUITE_BUSINESS_SLUG,
	GSUITE_EXTRA_LICENSE_SLUG,
} from 'calypso/lib/gsuite/constants';

/**
 * Determines whether the specified product slug is for G Suite Basic or Business.
 *
 * @param {string} productSlug - slug of the product
 * @returns {boolean} true if the slug refers to G Suite Basic or Business, false otherwise
 */
export function isGSuiteProductSlug( productSlug ) {
	return [ GSUITE_BASIC_SLUG, GSUITE_BUSINESS_SLUG ].includes( productSlug );
}

/**
 * Determines whether the specified product slug is for a G Suite extra license.
 *
 * @param {string} productSlug - slug of the product
 * @returns {boolean} true if the slug refers to an extra license, false otherwise
 */
export function isGSuiteExtraLicenseProductSlug( productSlug ) {
	return productSlug === GSUITE_EXTRA_LICENSE_SLUG;
}

/**
 * Determines whether the specified product slug refers to any type of G Suite product.
 *
 * @param {string} productSlug - slug of the product
 * @returns {boolean} true if the slug refers to any G Suite product, false otherwise
 */
export function isGSuiteOrExtraLicenseProductSlug( productSlug ) {
	return isGSuiteProductSlug( productSlug ) || isGSuiteExtraLicenseProductSlug( productSlug );
}
