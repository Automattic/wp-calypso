import {
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
} from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';

export const PRODUCT_OPTIONS: Record< string, string > = {
	jetpack_backup_t0_yearly: translate( '1GB' ),
	jetpack_backup_t1_yearly: translate( '10GB' ),
	jetpack_backup_t2_yearly: translate( '1TB(1000GB)' ),
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
