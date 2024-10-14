import { isEnabled } from '@automattic/calypso-config';
import { PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { getSite } from 'calypso/state/sites/selectors';
import { getCurrentPlan } from '..';
import type { AppState } from 'calypso/types';

/**
 * Checks whether the current site is on the migration trial.
 * @param {AppState} state Global state tree
 * @param {number|null} siteId - Site ID
 * @returns {boolean} Returns true if the site is on the trial
 */
export default function isSiteOnMigrationTrial( state: AppState, siteId: number | null ): boolean {
	if ( ! isEnabled( 'plans/migration-trial' ) ) {
		return false;
	}

	const currentPlan = getCurrentPlan( state, siteId );
	const site = getSite( state, siteId );
	const productSlug = currentPlan?.productSlug || site?.plan?.product_slug;

	return productSlug === PLAN_MIGRATION_TRIAL_MONTHLY;
}
