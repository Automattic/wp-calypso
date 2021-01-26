/**
 * Internal Dependencies
 */
import config from '@automattic/calypso-config';
import {
	GSUITE_PRODUCT_FAMILY,
	GOOGLE_WORKSPACE_PRODUCT_FAMILY,
	GSUITE_BASIC_SLUG,
	GSUITE_BUSINESS_SLUG,
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
} from 'calypso/lib/gsuite/constants';

export function getGoogleMailServiceFamily( productSlug = null ) {
	if ( productSlug ) {
		switch ( productSlug ) {
			case GSUITE_BASIC_SLUG:
			case GSUITE_BUSINESS_SLUG:
				return GSUITE_PRODUCT_FAMILY;
			case GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY:
				return GOOGLE_WORKSPACE_PRODUCT_FAMILY;
		}
	}

	if ( config.isEnabled( 'google-workspace-migration' ) ) {
		return GOOGLE_WORKSPACE_PRODUCT_FAMILY;
	}
	return GSUITE_PRODUCT_FAMILY;
}
