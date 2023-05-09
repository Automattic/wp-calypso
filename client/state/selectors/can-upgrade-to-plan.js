import {
	PLAN_FREE,
	PLAN_JETPACK_FREE,
	getPlan,
	isWpComBusinessPlan,
	isWpComEcommercePlan,
	isFreePlan,
} from '@automattic/calypso-products';
import { get } from 'lodash';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';

/**
 * Whether a given site can be upgraded to a specific plan.
 *
 * @param  {Object}   state      Global state tree
 * @param  {number}   siteId     The site we're interested in upgrading
 * @param  {string}   planKey    The plan we want to upgrade to
 * @returns {boolean}             True if the site can be upgraded
 */
export default function ( state, siteId, planKey ) {
	// Which "free plan" should we use to test
	const freePlan =
		isJetpackSite( state, siteId ) && ! isSiteAutomatedTransfer( state, siteId )
			? PLAN_JETPACK_FREE
			: PLAN_FREE;
	const plan = getCurrentPlan( state, siteId );
	const purchase = plan?.id ? getByPurchaseId( state, plan.id ) : null;

	// TODO: seems like expired isn't being set.
	// This information isn't currently available from the sites/%s/plans endpoint.
	const currentPlanSlug = get( plan, [ 'expired' ], false )
		? freePlan
		: get( plan, [ 'productSlug' ], freePlan );

	// Exception for upgrading Atomic v1 sites to eCommerce
	const isAtomicV1 =
		isSiteAutomatedTransfer( state, siteId ) && ! isSiteWpcomAtomic( state, siteId );
	if ( ( isWpComEcommercePlan( planKey ) && isAtomicV1 ) || purchase?.isLocked ) {
		return false;
	}

	// Exception for AutomatedTransfer on a free plan (expired subscription) to wpcom business plan
	if (
		( isWpComBusinessPlan( planKey ) || isWpComEcommercePlan( planKey ) ) &&
		isFreePlan( currentPlanSlug ) &&
		isSiteAutomatedTransfer( state, siteId )
	) {
		return true;
	}

	return get( getPlan( planKey ), [ 'availableFor' ], () => false )( currentPlanSlug );
}
