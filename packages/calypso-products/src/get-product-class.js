/**
 * Internal dependencies
 */
import { isJetpackBackupSlug } from './is-jetpack-backup-slug';

export function getProductClass( productSlug ) {
	if ( isJetpackBackupSlug( productSlug ) ) {
		return 'is-jetpack-backup';
	}

	return '';
}
