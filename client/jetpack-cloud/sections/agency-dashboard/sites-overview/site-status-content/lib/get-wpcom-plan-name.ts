import { getPlan, planMatches, GROUP_WPCOM } from '@automattic/calypso-products';

/**
 * Function to get the name of a WordPress.com plan.
 *
 * This function iterates over an array of plan slugs. If a slug matches a WordPress.com plan,
 * it returns the name of that plan. The matching is done using the `planMatches` function,
 * which checks if the plan belongs to the WordPress.com group.
 * @param {Array<string>} plans - An array of plan slugs.
 * @returns {string} The name of the first matching WordPress.com plan, or an empty string if no matching plan is found.
 */
const getWPCOMPlanName = ( plans: Array< string > ) => {
	const wpcomPlan = plans.find( ( plan ) => planMatches( plan, { group: GROUP_WPCOM } ) );
	return wpcomPlan ? getPlan( wpcomPlan )?.getTitle() : '';
};

export default getWPCOMPlanName;
