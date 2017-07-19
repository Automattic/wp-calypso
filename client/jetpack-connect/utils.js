/**
 * External dependencies
 */
import { get } from 'lodash';

import {
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
} from 'lib/plans/constants';

/**
 * Module constants
 */
const flowIntervalPlanMapping = {
	personal: {
		monthly: PLAN_JETPACK_PERSONAL_MONTHLY,
		yearly: PLAN_JETPACK_PERSONAL,
	},
	premium: {
		monthly: PLAN_JETPACK_PREMIUM_MONTHLY,
		yearly: PLAN_JETPACK_PREMIUM,
	},
	pro: {
		monthly: PLAN_JETPACK_BUSINESS_MONTHLY,
		yearly: PLAN_JETPACK_BUSINESS,
	},
};

/**
 * Calculate plan based on flow type and interval.
 *
 * @param   {String}  flowType personal | premium | pro
 * @param   {String}  interval yearly | monthly
 * @returns {?String}          Jetpack plan slug
 */
export function calculatePlan( flowType, interval ) {
	return get( flowIntervalPlanMapping, [ flowType, interval ], null );
}
