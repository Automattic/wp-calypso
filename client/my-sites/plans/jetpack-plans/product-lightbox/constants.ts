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
	PRODUCT_JETPACK_AI_YEARLY_100,
	PRODUCT_JETPACK_AI_YEARLY_200,
	PRODUCT_JETPACK_AI_YEARLY_500,
	PRODUCT_JETPACK_AI_YEARLY_750,
	PRODUCT_JETPACK_AI_YEARLY_1000,
	PRODUCT_JETPACK_AI_MONTHLY,
	PRODUCT_JETPACK_AI_MONTHLY_100,
	PRODUCT_JETPACK_AI_MONTHLY_200,
	PRODUCT_JETPACK_AI_MONTHLY_500,
	PRODUCT_JETPACK_AI_MONTHLY_750,
	PRODUCT_JETPACK_AI_MONTHLY_1000,
	PRODUCT_JETPACK_AI_BI_YEARLY,
	PRODUCT_JETPACK_AI_BI_YEARLY_100,
	PRODUCT_JETPACK_AI_BI_YEARLY_200,
	PRODUCT_JETPACK_AI_BI_YEARLY_500,
	PRODUCT_JETPACK_AI_BI_YEARLY_750,
	PRODUCT_JETPACK_AI_BI_YEARLY_1000,
	PRODUCT_JETPACK_STATS_BI_YEARLY,
	PRODUCT_JETPACK_STATS_BI_YEARLY_10K,
	PRODUCT_JETPACK_STATS_BI_YEARLY_100K,
	PRODUCT_JETPACK_STATS_BI_YEARLY_250K,
	PRODUCT_JETPACK_STATS_BI_YEARLY_500K,
	PRODUCT_JETPACK_STATS_BI_YEARLY_1M,
	PRODUCT_JETPACK_STATS_MONTHLY,
	PRODUCT_JETPACK_STATS_MONTHLY_10K,
	PRODUCT_JETPACK_STATS_MONTHLY_100K,
	PRODUCT_JETPACK_STATS_MONTHLY_250K,
	PRODUCT_JETPACK_STATS_MONTHLY_500K,
	PRODUCT_JETPACK_STATS_MONTHLY_1M,
	PRODUCT_JETPACK_STATS_YEARLY,
	PRODUCT_JETPACK_STATS_YEARLY_10K,
	PRODUCT_JETPACK_STATS_YEARLY_100K,
	PRODUCT_JETPACK_STATS_YEARLY_250K,
	PRODUCT_JETPACK_STATS_YEARLY_500K,
	PRODUCT_JETPACK_STATS_YEARLY_1M,
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
	[ PRODUCT_JETPACK_AI_YEARLY ]: translate( '100 requests /mo' ),
	[ PRODUCT_JETPACK_AI_YEARLY_100 ]: translate( '100 requests /mo' ),
	[ PRODUCT_JETPACK_AI_YEARLY_200 ]: translate( '200 requests /mo' ),
	[ PRODUCT_JETPACK_AI_YEARLY_500 ]: translate( '500 requests /mo' ),
	[ PRODUCT_JETPACK_AI_YEARLY_750 ]: translate( '750 requests /mo' ),
	[ PRODUCT_JETPACK_AI_YEARLY_1000 ]: translate( '1000 requests /mo' ),
	[ PRODUCT_JETPACK_AI_MONTHLY ]: translate( '100 requests /mo' ),
	[ PRODUCT_JETPACK_AI_MONTHLY_100 ]: translate( '100 requests /mo' ),
	[ PRODUCT_JETPACK_AI_MONTHLY_200 ]: translate( '200 requests /mo' ),
	[ PRODUCT_JETPACK_AI_MONTHLY_500 ]: translate( '500 requests /mo' ),
	[ PRODUCT_JETPACK_AI_MONTHLY_750 ]: translate( '750 requests /mo' ),
	[ PRODUCT_JETPACK_AI_MONTHLY_1000 ]: translate( '1000 requests /mo' ),
	[ PRODUCT_JETPACK_AI_BI_YEARLY ]: translate( '100 requests /mo' ),
	[ PRODUCT_JETPACK_AI_BI_YEARLY_100 ]: translate( '100 requests /mo' ),
	[ PRODUCT_JETPACK_AI_BI_YEARLY_200 ]: translate( '200 requests /mo' ),
	[ PRODUCT_JETPACK_AI_BI_YEARLY_500 ]: translate( '500 requests /mo' ),
	[ PRODUCT_JETPACK_AI_BI_YEARLY_750 ]: translate( '750 requests /mo' ),
	[ PRODUCT_JETPACK_AI_BI_YEARLY_1000 ]: translate( '1000 requests /mo' ),
	[ PRODUCT_JETPACK_STATS_YEARLY ]: translate( '10K site views /mo' ),
	[ PRODUCT_JETPACK_STATS_YEARLY_10K ]: translate( '10K site views /mo' ),
	[ PRODUCT_JETPACK_STATS_YEARLY_100K ]: translate( '100K site views /mo' ),
	[ PRODUCT_JETPACK_STATS_YEARLY_250K ]: translate( '250K site views /mo' ),
	[ PRODUCT_JETPACK_STATS_YEARLY_500K ]: translate( '500K site views /mo' ),
	[ PRODUCT_JETPACK_STATS_YEARLY_1M ]: translate( '1M site views /mo' ),
	[ PRODUCT_JETPACK_STATS_MONTHLY ]: translate( '10K site views /mo' ),
	[ PRODUCT_JETPACK_STATS_MONTHLY_10K ]: translate( '10K site views /mo' ),
	[ PRODUCT_JETPACK_STATS_MONTHLY_100K ]: translate( '100K site views /mo' ),
	[ PRODUCT_JETPACK_STATS_MONTHLY_250K ]: translate( '250K site views /mo' ),
	[ PRODUCT_JETPACK_STATS_MONTHLY_500K ]: translate( '500K site views /mo' ),
	[ PRODUCT_JETPACK_STATS_MONTHLY_1M ]: translate( '1M site views /mo' ),
	[ PRODUCT_JETPACK_STATS_BI_YEARLY ]: translate( '10K site views /mo' ),
	[ PRODUCT_JETPACK_STATS_BI_YEARLY_10K ]: translate( '10K site views /mo' ),
	[ PRODUCT_JETPACK_STATS_BI_YEARLY_100K ]: translate( '100K site views /mo' ),
	[ PRODUCT_JETPACK_STATS_BI_YEARLY_250K ]: translate( '250K site views /mo' ),
	[ PRODUCT_JETPACK_STATS_BI_YEARLY_500K ]: translate( '500K site views /mo' ),
	[ PRODUCT_JETPACK_STATS_BI_YEARLY_1M ]: translate( '1M site views /mo' ),
};

export const PRODUCT_OPTIONS_HEADER: Record< string, TranslateResult > = {
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
	[ PRODUCT_JETPACK_STATS_BI_YEARLY ]: translate( 'Pick your %(product)s tier', {
		args: { product: 'Stats' },
		comment: '%(product)s is the name of the product',
	} ),
	[ PRODUCT_JETPACK_STATS_MONTHLY ]: translate( 'Pick your %(product)s tier', {
		args: { product: 'Stats' },
		comment: '%(product)s is the name of the product',
	} ),
	[ PRODUCT_JETPACK_STATS_YEARLY ]: translate( 'Pick your %(product)s tier', {
		args: { product: 'Stats' },
		comment: '%(product)s is the name of the product',
	} ),
};
