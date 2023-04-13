import { getPlans, getPlanPath } from '@automattic/calypso-products';
import { find } from 'lodash';
import canUpgradeToPlan from 'calypso/state/selectors/can-upgrade-to-plan';

const PLANS_LIST = getPlans();

/**
 * Given a route (path) fragment used to indicate a plan, return the corresponding plan slug.
 *
 * @param  {Object}   state      Global state tree
 * @param  {number}   siteId     The site we're interested in upgrading
 * @param  {string}   path       The path fragment indicating the plan we want to upgrade to
 * @returns {string}              The plan slug that corresponds to the given path, or null if the site cannot be upgraded
 */
export default function ( state, siteId, path ) {
	return find(
		Object.keys( PLANS_LIST ),
		( planKey ) =>
			( planKey === path || getPlanPath( planKey ) === path ) &&
			canUpgradeToPlan( state, siteId, planKey )
	);
}
