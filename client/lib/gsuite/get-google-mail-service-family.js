/**
 * Internal Dependencies
 */
import config from 'calypso/config';
import {
	GSUITE_PRODUCT_FAMILY,
	GOOGLE_WORKSPACE_PRODUCT_FAMILY,
} from 'calypso/lib/gsuite/constants';

export function getGoogleMailServiceFamily() {
	if ( config.isEnabled( 'google-workspace-migration' ) ) {
		return GOOGLE_WORKSPACE_PRODUCT_FAMILY;
	}
	return GSUITE_PRODUCT_FAMILY;
}
