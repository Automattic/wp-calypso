import {
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_PREMIUM,
	PLAN_PERSONAL,
} from '@automattic/calypso-products';
import { getPlan } from '@automattic/calypso-products/src';

/**
 * Custom hook to get the name of a WordPress.com plan.
 *
 * This hook iterates over an array of plan slugs and returns the name of the first plan that matches one of the WordPress.com plans.
 * The matching is done by checking if the plan slug starts with the slug of a WordPress.com plan.
 * @param {Array<string>} plans - An array of plan slugs.
 * @returns {string} The name of the first matching WordPress.com plan, or an empty string if no matching plan is found.
 */
const PLANS = [ PLAN_BUSINESS, PLAN_ECOMMERCE, PLAN_PREMIUM, PLAN_PERSONAL ];

const useWPPlanName = ( plans: Array< string > ) => {
	const getPlanName = () => {
		for ( const plan of plans ) {
			const matchingPlan = PLANS.find( ( planConstant ) => plan.startsWith( planConstant ) );
			if ( matchingPlan ) {
				return getPlan( matchingPlan )?.getTitle();
			}
		}
		return '';
	};

	return getPlanName();
};

export default useWPPlanName;
