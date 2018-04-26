/** @format */

/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { PLANS_LIST } from 'lib/plans/constants';
import { getPlanPath } from 'lib/plans';
import { canUpgradeToPlan } from 'state/selectors';

export default function( state, siteId, path ) {
	return find(
		Object.keys( PLANS_LIST ),
		planKey =>
			( planKey === path || getPlanPath( planKey ) === path ) &&
			canUpgradeToPlan( state, siteId, planKey )
	);
}
