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
	[ PRODUCT_JETPACK_SOCIAL_BASIC_BI_YEARLY ]: translate( 'Social Basic', {
		comment: 'Get up to 1000 shares',
	} ),
	[ PRODUCT_JETPACK_SOCIAL_BASIC ]: translate( 'Social Basic', {
		comment: 'Get up to 1000 shares',
	} ),
	[ PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY ]: translate( 'Social Basic', {
		comment: 'Get up to 1000 shares',
	} ),
	[ PRODUCT_JETPACK_SOCIAL_ADVANCED_BI_YEARLY ]: translate( 'Social Advanced', {
		comment: 'Get unlimited shares and share as a post by attaching images or videos.',
	} ),
	[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: translate( 'Social Advanced', {
		comment: 'Get unlimited shares and share as a post by attaching images or videos.',
	} ),
	[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: translate( 'Social Advanced', {
		comment: 'Get unlimited shares and share as a post by attaching images or videos.',
	} ),
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
};
