import {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY,
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
	GSUITE_BASIC_SLUG,
	GSUITE_BUSINESS_SLUG,
} from '@automattic/calypso-products';
import {
	GOOGLE_WORKSPACE_PRODUCT_FAMILY,
	GSUITE_PRODUCT_FAMILY,
} from 'calypso/lib/gsuite/constants';

/**
 * @param {string|null} productSlug - optional product slug
 * @returns {string}
 */
export function getGoogleMailServiceFamily( productSlug = null ) {
	if ( productSlug ) {
		switch ( productSlug ) {
			case GSUITE_BASIC_SLUG:
			case GSUITE_BUSINESS_SLUG:
				return GSUITE_PRODUCT_FAMILY;

			case GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY:
			case GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY:
				return GOOGLE_WORKSPACE_PRODUCT_FAMILY;
		}
	}

	return GOOGLE_WORKSPACE_PRODUCT_FAMILY;
}
