import {
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
} from '@automattic/calypso-products';

export const PRODUCT_OPTIONS: Record< string, string > = {
	jetpack_backup_t0_yearly: '1GB',
	jetpack_backup_t1_yearly: '10GB',
	jetpack_backup_t2_yearly: '1TB(1000GB)',
};

export const JETPACK_RELATED_PRODUCTS_MAP: Record< string, string[] > = {
	[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: [
		PRODUCT_JETPACK_BACKUP_T1_YEARLY,
		PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	],
	[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: [
		PRODUCT_JETPACK_BACKUP_T1_YEARLY,
		PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	],
};
