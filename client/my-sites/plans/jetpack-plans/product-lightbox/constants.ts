import {
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
	PRODUCT_JETPACK_SOCIAL_BASIC,
	PRODUCT_JETPACK_SOCIAL_ADVANCED,
} from '@automattic/calypso-products';
import { translate, TranslateResult } from 'i18n-calypso';

export const PRODUCT_OPTIONS: Record< string, TranslateResult > = {
	[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: translate( '10GB', {
		comment: 'GB here is the abbreviation for Gigabyte',
	} ),
	[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: translate( '1TB (1000GB)', {
		comment: 'GB here is the abbreviation for Gigabyte, and TB is abbreviation for Terabyte',
	} ),
	[ PLAN_JETPACK_SECURITY_T1_YEARLY ]: translate( '10GB', {
		comment: 'GB here is the abbreviation for Gigabyte',
	} ),
	[ PLAN_JETPACK_SECURITY_T2_YEARLY ]: translate( '1TB (1000GB)', {
		comment: 'GB here is the abbreviation for Gigabyte, and TB is abbreviation for Terabyte',
	} ),
	[ PRODUCT_JETPACK_SOCIAL_BASIC ]: translate( 'Social Basic', {
		comment: 'Get upto 1000 shares',
	} ),
	[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: translate( 'Social Advanced', {
		comment: 'Get unlimited shares',
	} ),
};

export const PRODUCT_OPTIONS_HEADER: Record< string, string > = {
	[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: translate( 'Choose a storage option:' ),
	[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: translate( 'Choose a storage option:' ),
	[ PLAN_JETPACK_SECURITY_T1_YEARLY ]: translate( 'Choose a storage option:' ),
	[ PLAN_JETPACK_SECURITY_T2_YEARLY ]: translate( 'Choose a storage option:' ),
	[ PRODUCT_JETPACK_SOCIAL_BASIC ]: translate( 'Choose a social plan:' ),
	[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: translate( 'Choose a social plan:' ),
};
