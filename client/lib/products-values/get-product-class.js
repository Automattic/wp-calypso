/**
 * Internal dependencies
 */
import { isJetpackBackupSlug } from 'lib/products-values/is-jetpack-backup-slug';

export function getProductClass( productSlug ) {
	if ( isJetpackBackupSlug( productSlug ) ) {
		return 'is-jetpack-backup';
	}

	return '';
}
