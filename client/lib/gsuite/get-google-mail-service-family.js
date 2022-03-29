import { isGSuiteProductSlug } from '@automattic/calypso-products';
import {
	GOOGLE_WORKSPACE_PRODUCT_FAMILY,
	GSUITE_PRODUCT_FAMILY,
} from 'calypso/lib/gsuite/constants';

/**
 * @param {string|null} productSlug - optional product slug
 * @returns {string}
 */
export function getGoogleMailServiceFamily( productSlug = null ) {
	if ( isGSuiteProductSlug( productSlug ) ) {
		return GSUITE_PRODUCT_FAMILY;
	}

	return GOOGLE_WORKSPACE_PRODUCT_FAMILY;
}
