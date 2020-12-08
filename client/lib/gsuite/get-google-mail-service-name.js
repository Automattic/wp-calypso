/**
 * Internal Dependencies
 */
import config from 'calypso/config';
import { GSUITE_PRODUCT_NAME, GOOGLE_WORKSPACE_PRODUCT_NAME } from 'calypso/lib/gsuite/constants';

export function getGoogleMailServiceName( productName = null ) {
	if ( productName ) {
		return productName;
	}
	if ( config.isEnabled( 'google-workspace-migration' ) ) {
		return GOOGLE_WORKSPACE_PRODUCT_NAME;
	}
	return GSUITE_PRODUCT_NAME;
}
