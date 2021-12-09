import { JETPACK_BACKUP_PRODUCTS, JETPACK_SCAN_PRODUCTS } from './constants';

export function isJetpackCloudProductSlug( productSlug: string ): boolean {
	return (
		( JETPACK_SCAN_PRODUCTS as ReadonlyArray< string > ).includes( productSlug ) ||
		( JETPACK_BACKUP_PRODUCTS as ReadonlyArray< string > ).includes( productSlug )
	);
}
