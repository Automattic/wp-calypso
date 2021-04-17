/**
 * Internal dependencies
 */
import { isJetpackBackupSlug } from './product-identification';

export function getProductClass( productSlug ) {
	if ( isJetpackBackupSlug( productSlug ) ) {
		return 'is-jetpack-backup';
	}

	return '';
}
