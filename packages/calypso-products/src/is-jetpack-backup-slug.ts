import { JETPACK_BACKUP_PRODUCTS } from './constants';

export function isJetpackBackupSlug( productSlug: string ): boolean {
	return ( JETPACK_BACKUP_PRODUCTS as ReadonlyArray< string > ).includes( productSlug );
}
