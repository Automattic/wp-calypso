import { isJetpackBackupSlug } from './is-jetpack-backup-slug';

export function getProductClass( productSlug: string ): 'is-jetpack-backup' | '' {
	if ( isJetpackBackupSlug( productSlug ) ) {
		return 'is-jetpack-backup';
	}
	return '';
}
