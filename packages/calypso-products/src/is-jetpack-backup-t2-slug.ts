import { JETPACK_BACKUP_T2_PRODUCTS } from './constants';

export function isJetpackBackupT2Slug( productSlug: string ): boolean {
	return ( JETPACK_BACKUP_T2_PRODUCTS as ReadonlyArray< string > ).includes( productSlug );
}
