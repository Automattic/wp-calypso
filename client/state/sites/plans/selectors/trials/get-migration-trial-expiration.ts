import { isEnabled } from '@automattic/calypso-config';
import { PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import moment, { Moment } from 'moment';
import { SitePlanData } from 'calypso/my-sites/checkout/src/hooks/product-variants';
import { getCurrentPlan } from '../';
import type { AppState } from 'calypso/types';

/**
 * Checks if the plan is a migration trial.
 * @param {SitePlanData} plan - Plan object
 * @returns {boolean} returns true if the plan is an migration trial
 */
function isMigrationTrialPlan( plan: SitePlanData ): boolean {
	return plan.productSlug === PLAN_MIGRATION_TRIAL_MONTHLY;
}

/**
 * Returns the expiration date of the migration trial. If the trial is not active, returns null.
 * @param {AppState} state - Global state tree
 * @param {number} siteId - Site ID
 * @returns {Moment|null} Expiration date of the trial, or null if the trial is not active.
 */
export default function getMigrationTrialExpiration(
	state: AppState,
	siteId: number
): Moment | null {
	if ( ! isEnabled( 'plans/migration-trial' ) ) {
		return null;
	}

	const currentPlan = getCurrentPlan( state, siteId );
	if ( ! currentPlan || ! isMigrationTrialPlan( currentPlan as SitePlanData ) ) {
		return null;
	}

	return moment.utc( currentPlan.expiryDate );
}
