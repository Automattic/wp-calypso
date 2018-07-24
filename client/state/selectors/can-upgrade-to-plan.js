/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { PLAN_FREE, PLAN_JETPACK_FREE } from 'lib/plans/constants';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import { getPlan } from 'lib/plans';
import { isJetpackSite } from 'state/sites/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';

/**
 * Whether a given site can be upgraded to a specific plan.
 *
 * @param  {Object}   state      Global state tree
 * @param  {Number}   siteId     The site we're interested in upgrading
 * @param  {String}   planKey    The plan we want to upgrade to
 * @return {Boolean}             True if the site can be upgraded
 */
export default function( state, siteId, planKey ) {
	// Which "free plan" should we use to test
	const freePlan =
		isJetpackSite( state, siteId ) && ! isSiteAutomatedTransfer( state, siteId )
			? PLAN_JETPACK_FREE
			: PLAN_FREE;
	const plan = getCurrentPlan( state, siteId );
	const planSlug = get( plan, [ 'expired' ], false )
		? freePlan
		: get( plan, [ 'productSlug' ], freePlan );

	return get( getPlan( planKey ), [ 'availableFor' ], () => false )( planSlug );
}
