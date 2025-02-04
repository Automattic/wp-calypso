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
	[ PRODUCT_JETPACK_AI_YEARLY ]: translate( '%(numRequests)d requests /mo', {
		args: {
			numRequests: 100,
		},
		comment: '%(numRequests)d is the number of requests per month',
	} ),
	[ PRODUCT_JETPACK_AI_YEARLY_100 ]: translate( '%(numRequests)d requests /mo', {
		args: {
			numRequests: 100,
		},
		comment: '%(numRequests)d is the number of requests per month',
	} ),
	[ PRODUCT_JETPACK_AI_YEARLY_200 ]: translate( '%(numRequests)d requests /mo', {
		args: {
			numRequests: 200,
		},
		comment: '%(numRequests)d is the number of requests per month',
	} ),
	[ PRODUCT_JETPACK_AI_YEARLY_500 ]: translate( '%(numRequests)d requests /mo', {
		args: {
			numRequests: 500,
		},
		comment: '%(numRequests)d is the number of requests per month',
	} ),
	[ PRODUCT_JETPACK_AI_YEARLY_750 ]: translate( '%(numRequests)d requests /mo', {
		args: {
			numRequests: 750,
		},
		comment: '%(numRequests)d is the number of requests per month',
	} ),
	[ PRODUCT_JETPACK_AI_YEARLY_1000 ]: translate( '%(numRequests)d requests /mo', {
		args: {
			numRequests: 1000,
		},
		comment: '%(numRequests)d is the number of requests per month',
	} ),
	[ PRODUCT_JETPACK_AI_MONTHLY ]: translate( '%(numRequests)d requests /mo', {
		args: {
			numRequests: 100,
		},
		comment: '%(numRequests)d is the number of requests per month',
	} ),
	[ PRODUCT_JETPACK_AI_MONTHLY_100 ]: translate( '%(numRequests)d requests /mo', {
		args: {
			numRequests: 100,
		},
		comment: '%(numRequests)d is the number of requests per month',
	} ),
	[ PRODUCT_JETPACK_AI_MONTHLY_200 ]: translate( '%(numRequests)d requests /mo', {
		args: {
			numRequests: 200,
		},
		comment: '%(numRequests)d is the number of requests per month',
	} ),
	[ PRODUCT_JETPACK_AI_MONTHLY_500 ]: translate( '%(numRequests)d requests /mo', {
		args: {
			numRequests: 500,
		},
		comment: '%(numRequests)d is the number of requests per month',
	} ),
	[ PRODUCT_JETPACK_AI_MONTHLY_750 ]: translate( '%(numRequests)d requests /mo', {
		args: {
			numRequests: 750,
		},
		comment: '%(numRequests)d is the number of requests per month',
	} ),
	[ PRODUCT_JETPACK_AI_MONTHLY_1000 ]: translate( '%(numRequests)d requests /mo', {
		args: {
			numRequests: 1000,
		},
		comment: '%(numRequests)d is the number of requests per month',
	} ),
	[ PRODUCT_JETPACK_AI_BI_YEARLY ]: translate( '%(numRequests)d requests /mo', {
		args: {
			numRequests: 100,
		},
		comment: '%(numRequests)d is the number of requests per month',
	} ),
	[ PRODUCT_JETPACK_AI_BI_YEARLY_100 ]: translate( '%(numRequests)d requests /mo', {
		args: {
			numRequests: 100,
		},
		comment: '%(numRequests)d is the number of requests per month',
	} ),
	[ PRODUCT_JETPACK_AI_BI_YEARLY_200 ]: translate( '%(numRequests)d requests /mo', {
		args: {
			numRequests: 200,
		},
		comment: '%(numRequests)d is the number of requests per month',
	} ),
	[ PRODUCT_JETPACK_AI_BI_YEARLY_500 ]: translate( '%(numRequests)d requests /mo', {
		args: {
			numRequests: 500,
		},
		comment: '%(numRequests)d is the number of requests per month',
	} ),
	[ PRODUCT_JETPACK_AI_BI_YEARLY_750 ]: translate( '%(numRequests)d requests /mo', {
		args: {
			numRequests: 750,
		},
		comment: '%(numRequests)d is the number of requests per month',
	} ),
	[ PRODUCT_JETPACK_AI_BI_YEARLY_1000 ]: translate( '%(numRequests)d requests /mo', {
		args: {
			numRequests: 1000,
		},
		comment: '%(numRequests)d is the number of requests per month',
	} ),
	[ PRODUCT_JETPACK_STATS_YEARLY ]: translate( '%(numSiteViews)s site views /mo', {
		args: {
			numSiteViews: '10K',
		},
		comment: '%(numSiteViews)s is the number of site views per month',
	} ),
	[ PRODUCT_JETPACK_STATS_YEARLY_10K ]: translate( '%(numSiteViews)s site views /mo', {
		args: {
			numSiteViews: '10K',
		},
		comment: '%(numSiteViews)s is the number of site views per month',
	} ),
	[ PRODUCT_JETPACK_STATS_YEARLY_100K ]: translate( '%(numSiteViews)s site views /mo', {
		args: {
			numSiteViews: '100K',
		},
		comment: '%(numSiteViews)s is the number of site views per month',
	} ),
	[ PRODUCT_JETPACK_STATS_YEARLY_250K ]: translate( '%(numSiteViews)s site views /mo', {
		args: {
			numSiteViews: '250K',
		},
		comment: '%(numSiteViews)s is the number of site views per month',
	} ),
	[ PRODUCT_JETPACK_STATS_YEARLY_500K ]: translate( '%(numSiteViews)s site views /mo', {
		args: {
			numSiteViews: '500K',
		},
		comment: '%(numSiteViews)s is the number of site views per month',
	} ),
	[ PRODUCT_JETPACK_STATS_YEARLY_1M ]: translate( '%(numSiteViews)s site views /mo', {
		args: {
			numSiteViews: '1M',
		},
		comment: '%(numSiteViews)s is the number of site views per month',
	} ),
	[ PRODUCT_JETPACK_STATS_MONTHLY ]: translate( '%(numSiteViews)s site views /mo', {
		args: {
			numSiteViews: '10K',
		},
		comment: '%(numSiteViews)s is the number of site views per month',
	} ),
	[ PRODUCT_JETPACK_STATS_MONTHLY_10K ]: translate( '%(numSiteViews)s site views /mo', {
		args: {
			numSiteViews: '10K',
		},
		comment: '%(numSiteViews)s is the number of site views per month',
	} ),
	[ PRODUCT_JETPACK_STATS_MONTHLY_100K ]: translate( '%(numSiteViews)s site views /mo', {
		args: {
			numSiteViews: '100K',
		},
		comment: '%(numSiteViews)s is the number of site views per month',
	} ),
	[ PRODUCT_JETPACK_STATS_MONTHLY_250K ]: translate( '%(numSiteViews)s site views /mo', {
		args: {
			numSiteViews: '250K',
		},
		comment: '%(numSiteViews)s is the number of site views per month',
	} ),
	[ PRODUCT_JETPACK_STATS_MONTHLY_500K ]: translate( '%(numSiteViews)s site views /mo', {
		args: {
			numSiteViews: '500K',
		},
		comment: '%(numSiteViews)s is the number of site views per month',
	} ),
	[ PRODUCT_JETPACK_STATS_MONTHLY_1M ]: translate( '%(numSiteViews)s site views /mo', {
		args: {
			numSiteViews: '1M',
		},
		comment: '%(numSiteViews)s is the number of site views per month',
	} ),
	[ PRODUCT_JETPACK_STATS_BI_YEARLY ]: translate( '%(numSiteViews)s site views /mo', {
		args: {
			numSiteViews: '10K',
		},
		comment: '%(numSiteViews)s is the number of site views per month',
	} ),
	[ PRODUCT_JETPACK_STATS_BI_YEARLY_10K ]: translate( '%(numSiteViews)s site views /mo', {
		args: {
			numSiteViews: '10K',
		},
		comment: '%(numSiteViews)s is the number of site views per month',
	} ),
	[ PRODUCT_JETPACK_STATS_BI_YEARLY_100K ]: translate( '%(numSiteViews)s site views /mo', {
		args: {
			numSiteViews: '100K',
		},
		comment: '%(numSiteViews)s is the number of site views per month',
	} ),
	[ PRODUCT_JETPACK_STATS_BI_YEARLY_250K ]: translate( '%(numSiteViews)s site views /mo', {
		args: {
			numSiteViews: '250K',
		},
		comment: '%(numSiteViews)s is the number of site views per month',
	} ),
	[ PRODUCT_JETPACK_STATS_BI_YEARLY_500K ]: translate( '%(numSiteViews)s site views /mo', {
		args: {
			numSiteViews: '500K',
		},
		comment: '%(numSiteViews)s is the number of site views per month',
	} ),
	[ PRODUCT_JETPACK_STATS_BI_YEARLY_1M ]: translate( '%(numSiteViews)s site views /mo', {
		args: {
			numSiteViews: '1M',
		},
		comment: '%(numSiteViews)s is the number of site views per month',
	} ),
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
	[ PRODUCT_JETPACK_AI_BI_YEARLY ]: translate( 'Pick your %(product)s tier', {
		args: { product: 'AI' },
		comment: '%(product)s is the name of the product',
	} ),
	[ PRODUCT_JETPACK_AI_YEARLY ]: translate( 'Pick your %(product)s tier', {
		args: { product: 'AI' },
		comment: '%(product)s is the name of the product',
	} ),
	[ PRODUCT_JETPACK_AI_MONTHLY ]: translate( 'Pick your %(product)s tier', {
		args: { product: 'AI' },
		comment: '%(product)s is the name of the product',
	} ),
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

export const PRODUCT_OPTIONS_HEADER_INFO_CONTENT: Record< string, TranslateResult > = {
	[ PRODUCT_JETPACK_AI_BI_YEARLY ]: translate(
		'Each interaction with the AI system counts as one request. Images may use multiple requests. You can upgrade at any time if you run out of requests.'
	),
	[ PRODUCT_JETPACK_AI_YEARLY ]: translate(
		'Each interaction with the AI system counts as one request. Images may use multiple requests. You can upgrade at any time if you run out of requests.'
	),
	[ PRODUCT_JETPACK_AI_MONTHLY ]: translate(
		'Each interaction with the AI system counts as one request. Images may use multiple requests. You can upgrade at any time if you run out of requests.'
	),
	[ PRODUCT_JETPACK_STATS_MONTHLY ]: translate(
		'Upgrade your plan when your website gets more visitors! Our plans adjust to match your site’s growth.'
	),
	[ PRODUCT_JETPACK_STATS_YEARLY ]: translate(
		'Upgrade your plan when your website gets more visitors! Our plans adjust to match your site’s growth.'
	),
	[ PRODUCT_JETPACK_STATS_BI_YEARLY ]: translate(
		'Upgrade your plan when your website gets more visitors! Our plans adjust to match your site’s growth.'
	),
};
