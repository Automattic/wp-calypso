import { fetchSitePlansCompleted } from 'state/sites/plans/actions';

import {
	SITE_PLANS_FETCH,
} from 'state/action-types';

const sitePlanData = {
    "1": {
		"raw_price": 0,
		"formatted_price": "$0",
		"raw_discount": 0,
		"formatted_discount": "$0",
		"product_slug": "free_plan",
		"product_name": "WordPress.com Free",
		"discount_reason": null,
		"currency_code": "USD",
		"user_is_owner": null,
		"current_plan": true,
		"id": null,
		"has_domain_credit": false,
		"interval": -1
    },
    "1009": {
		"raw_price": 35.88,
		"formatted_price": "$35.88",
		"raw_discount": 0,
		"formatted_discount": "$0",
		"product_slug": "personal-bundle",
		"product_name": "WordPress.com Personal",
		"discount_reason": null,
		"currency_code": "USD",
		"can_start_trial": true,
		"interval": 365
    },
    "1003": {
		"raw_price": 99,
		"formatted_price": "$99",
		"raw_discount": 0,
		"formatted_discount": "$0",
		"product_slug": "value_bundle",
		"product_name": "WordPress.com Premium",
		"discount_reason": null,
		"currency_code": "USD",
		"can_start_trial": true,
		"interval": 365
    },
    "1008": {
		"raw_price": 299,
		"formatted_price": "$299",
		"raw_discount": 0,
		"formatted_discount": "$0",
		"product_slug": "business-bundle",
		"product_name": "WordPress.com Business",
		"discount_reason": null,
		"currency_code": "USD",
		"can_start_trial": true,
		"interval": 365
    },
}

export const fetchSitePlans = ( { dispatch } ) => ( { siteId } ) => {
	return dispatch( fetchSitePlansCompleted( siteId, sitePlanData ) );
};

export default [ SITE_PLANS_FETCH, fetchSitePlans ];
