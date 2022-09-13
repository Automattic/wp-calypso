import {
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
} from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';

export const PRODUCT_OPTIONS: Record< string, string > = {
	[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: translate( '10GB' ),
	[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: translate( '1TB(1000GB)' ),
};

export const PRODUCT_OPTIONS_HEADER: Record< string, string > = {
	[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: translate( 'Choose a storage option' ),
	[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: translate( 'Choose a storage option' ),
};
