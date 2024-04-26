import {
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
	PRODUCT_JETPACK_SOCIAL_BASIC,
	PRODUCT_JETPACK_SOCIAL_ADVANCED_BI_YEARLY,
	PRODUCT_JETPACK_SOCIAL_ADVANCED,
	PRODUCT_JETPACK_SOCIAL_BASIC_BI_YEARLY,
	PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY,
	PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY,
	PRODUCT_JETPACK_AI_YEARLY,
	PRODUCT_JETPACK_AI_MONTHLY,
	PRODUCT_JETPACK_AI_BI_YEARLY,
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
	[ PRODUCT_JETPACK_SOCIAL_BASIC_BI_YEARLY ]: 'Social Basic',
	[ PRODUCT_JETPACK_SOCIAL_BASIC ]: 'Social Basic',
	[ PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY ]: 'Social Basic',
	[ PRODUCT_JETPACK_SOCIAL_ADVANCED_BI_YEARLY ]: 'Social Advanced',
	[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: 'Social Advanced',
	[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: 'Social Advanced',
};

export const PRODUCT_TIER_OPTIONS: Record< string, TranslateResult > = {
	[ `${ PRODUCT_JETPACK_AI_YEARLY }:-q-100` ]: translate( '100 requests /mo' ),
	[ `${ PRODUCT_JETPACK_AI_YEARLY }:-q-200` ]: translate( '200 requests /mo' ),
	[ `${ PRODUCT_JETPACK_AI_YEARLY }:-q-500` ]: translate( '500 requests /mo' ),
	[ `${ PRODUCT_JETPACK_AI_YEARLY }:-q-750` ]: translate( '750 requests /mo' ),
	[ `${ PRODUCT_JETPACK_AI_YEARLY }:-q-1000` ]: translate( '1000 requests /mo' ),
	[ `${ PRODUCT_JETPACK_AI_MONTHLY }:-q-100` ]: translate( '100 requests /mo' ),
	[ `${ PRODUCT_JETPACK_AI_MONTHLY }:-q-200` ]: translate( '200 requests /mo' ),
	[ `${ PRODUCT_JETPACK_AI_MONTHLY }:-q-500` ]: translate( '500 requests /mo' ),
	[ `${ PRODUCT_JETPACK_AI_MONTHLY }:-q-750` ]: translate( '750 requests /mo' ),
	[ `${ PRODUCT_JETPACK_AI_MONTHLY }:-q-1000` ]: translate( '1000 requests /mo' ),
	[ `${ PRODUCT_JETPACK_AI_BI_YEARLY }:-q-100` ]: translate( '100 requests /mo' ),
	[ `${ PRODUCT_JETPACK_AI_BI_YEARLY }:-q-200` ]: translate( '200 requests /mo' ),
	[ `${ PRODUCT_JETPACK_AI_BI_YEARLY }:-q-500` ]: translate( '500 requests /mo' ),
	[ `${ PRODUCT_JETPACK_AI_BI_YEARLY }:-q-750` ]: translate( '750 requests /mo' ),
	[ `${ PRODUCT_JETPACK_AI_BI_YEARLY }:-q-1000` ]: translate( '1000 requests /mo' ),
};

export const PRODUCT_OPTIONS_HEADER: Record< string, string > = {
	[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: translate( 'Choose a storage option:' ),
	[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: translate( 'Choose a storage option:' ),
	[ PLAN_JETPACK_SECURITY_T1_YEARLY ]: translate( 'Choose a storage option:' ),
	[ PLAN_JETPACK_SECURITY_T2_YEARLY ]: translate( 'Choose a storage option:' ),
	[ PRODUCT_JETPACK_SOCIAL_BASIC_BI_YEARLY ]: translate( 'Select your plan:' ),
	[ PRODUCT_JETPACK_SOCIAL_BASIC ]: translate( 'Select your plan:' ),
	[ PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY ]: translate( 'Select your plan:' ),
	[ PRODUCT_JETPACK_SOCIAL_ADVANCED_BI_YEARLY ]: translate( 'Select your plan:' ),
	[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: translate( 'Select your plan:' ),
	[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: translate( 'Select your plan:' ),
	[ PRODUCT_JETPACK_AI_BI_YEARLY ]: translate( 'Pick your AI tier' ),
	[ PRODUCT_JETPACK_AI_YEARLY ]: translate( 'Pick your AI tier' ),
	[ PRODUCT_JETPACK_AI_MONTHLY ]: translate( 'Pick your AI tier' ),
};
