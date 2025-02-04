import { isEnabled } from '@automattic/calypso-config';
import moment, { Moment } from 'moment';
import getMigrationTrialExpiration from './get-migration-trial-expiration';
import type { AppState } from 'calypso/types';

/**
 * Get the number of days left in the migration trial. If the trial is not active, returns null.
 * @param {AppState} state - Global state tree
 * @param {number} siteId - Site ID
 * @returns {null|number} Number of days left in the trial as a float, or null if the trial is not active.
 */
export default function getMigrationTrialDaysLeft(
	state: AppState,
	siteId: number
): number | null {
	if ( ! isEnabled( 'plans/migration-trial' ) ) {
		return null;
	}

	const trialExpirationDate: Moment | null = getMigrationTrialExpiration( state, siteId );
	if ( ! trialExpirationDate ) {
		return null;
	}

	return trialExpirationDate.diff( moment().utc(), 'days', true );
}
