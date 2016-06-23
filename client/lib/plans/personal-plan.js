/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import has from 'lodash/has';
import head from 'lodash/head';
import property from 'lodash/property';
import map from 'lodash/map';
import some from 'lodash/some';
import isEmpty from 'lodash/isEmpty';
import findIndex from 'lodash/findIndex';
import flow from 'lodash/flow';
import partialRight from 'lodash/partialRight';
import matchesProperty from 'lodash/matchesProperty';

/**
 * Internal dependencies
 */
import formatCurrency from 'lib/format-currency';
import { PLAN_FREE, PLAN_PERSONAL } from './constants';

export const personalPlan = {
	product_id: 1009,
	product_name: translate( 'WordPress.com Personal' ),
	prices: {
		USD: 71.88,
		EUR: 71.88,
		GBR: 54,
		JPY: 8985,
		AUS: 97,
		CAN: 97
	},
	product_name_short: translate( 'Personal' ),
	product_slug: PLAN_PERSONAL,
	tagline: translate( 'Get your own domain' ),
	shortdesc: translate( 'Use your own domain and establish your online presence without ads.' ),
	description: translate( 'Use your own domain and establish your online presence without ads.' ),
	capability: 'manage_options',
	features_highlight: [
		{ items: [ 'no-adverts/no-adverts.php', 'custom-domain', 'support', 'space' ] },
		{ title: translate( 'Included with all plans:' ), items: [ 'free-blog' ] }
	],
	bill_period: 365,
	product_type: 'bundle',
	available: 'yes',
	bundle_product_ids: [ 12, 9, 50, 5, 6, 46, 54, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 72, 73, 74, 75, 16 ],
	bill_period_label: translate( 'per year' ),
	has_domain_credit: true
};

const getCurrencyCode = plans => head( map( plans, property( 'currency_code' ) ) ) || 'USD';

const hasCurrentPlan = partialRight( some, matchesProperty( 'current_plan', true ) );

const applyCurrency = currencyCode => {
	const cost = personalPlan.prices[ currencyCode ];
	const price = formatCurrency( cost, currencyCode );

	return {
		...personalPlan,
		cost,
		price,
		raw_price: cost,
		formatted_price: price,
		currency_code: currencyCode
	};
};

const formatPlan = flow( getCurrencyCode, applyCurrency );

export const insertPersonalPlan = plans => {
	const freePlanIndex = findIndex( plans, matchesProperty( 'product_slug', PLAN_FREE ) );
	const hasPersonalPlan = some( plans, matchesProperty( 'product_slug', PLAN_PERSONAL ) );

	return ! hasPersonalPlan
		? [ ...plans.slice( 0, freePlanIndex + 1 ), formatPlan( plans ), ...plans.slice( freePlanIndex + 1 ) ]
		: plans;
};

export const insertSitePersonalPlan = plans => {
	const {
		product_id,
		formatted_price,
		has_domain_credit,
		product_name,
		product_slug,
		raw_price,
		currency_code
	} = formatPlan( plans );

	if ( ! ( isEmpty( plans ) || has( plans, product_id ) ) ) {
		return {
			...plans,
			[ product_id ]: {
				current_plan: ! hasCurrentPlan( plans ),
				currency_code,
				can_start_trial: true,
				discount_reason: null,
				formatted_discount: '$0',
				has_domain_credit,
				formatted_price,
				product_name,
				product_slug,
				product_id,
				raw_discount: 0,
				raw_price
			}
		};
	}

	return plans;
};
