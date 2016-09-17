import { fetchSitePlansCompleted } from 'state/sites/plans/actions';

import {
	SITE_PLANS_FETCH,
} from 'state/action-types';

const sitePlanData = {
	1: {
		currency_code: 'USD',
		discount_reason: null,
		formatted_discount: '$0',
		formatted_price: '$0',
		interval: -1,
		product_name: 'WordPress.com Free',
		product_slug: 'free_plan',
		raw_discount: 0,
		raw_price: 0
	},
	1003: {
		can_start_trial: false,
		currency_code: 'USD',
		discount_reason: null,
		formatted_discount: '$0',
		formatted_price: '$99',
		interval: 365,
		product_name: 'WordPress.com Premium',
		product_slug: 'value_bundle',
		raw_discount: 0,
		raw_price: 99
	},
	1008: {
		auto_renew: true,
		currency_code: 'USD',
		current_plan: true,
		discount_reason: null,
		expiry: '2017-05-30',
		formatted_discount: '$0',
		formatted_price: '$299',
		free_trial: false,
		has_domain_credit: true,
		id: '6201664',
		interval: 365,
		product_name: 'WordPress.com Business',
		product_slug: 'business-bundle',
		raw_discount: 0,
		raw_price: 299,
		subscribed_date: '2016-05-30 09:08:24',
		user_facing_expiry: '2017-05-27',
		user_is_owner: true
	},
	1009: {
		can_start_trial: false,
		currency_code: 'USD',
		discount_reason: null,
		formatted_discount: '$0',
		formatted_price: '$35.88',
		interval: 365,
		product_name: 'WordPress.com Personal',
		product_slug: 'personal-bundle',
		raw_discount: 0,
		raw_price: 35.88
	},
};

export const fetchSitePlans = ( { dispatch } ) => ( { siteId } ) => {
	return dispatch( fetchSitePlansCompleted( siteId, sitePlanData ) );
};

export default [ SITE_PLANS_FETCH, fetchSitePlans ];
