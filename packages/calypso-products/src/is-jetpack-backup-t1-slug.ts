import { JETPACK_BACKUP_T1_PRODUCTS } from './constants';

export function isJetpackBackupT1Slug( productSlug: string ): boolean {
	return ( JETPACK_BACKUP_T1_PRODUCTS as ReadonlyArray< string > ).includes( productSlug );
}
