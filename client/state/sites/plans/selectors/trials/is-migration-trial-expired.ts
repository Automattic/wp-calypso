import { isEnabled } from '@automattic/calypso-config';
import { AppState } from 'calypso/types';
import getMigrationTrialDaysLeft from './get-migration-trial-days-left';

/**
 * Returns true if the Migration trial has expired. If the trial is not active, returns null.
 * @param {AppState} state - Global state tree
 * @param {number} siteId - Site ID
 * @returns {boolean|null}
 */
export default function isMigrationTrialExpired( state: AppState, siteId: number ): boolean | null {
	if ( ! isEnabled( 'plans/migration-trial' ) ) {
		return null;
	}

	const trialDaysLeft = getMigrationTrialDaysLeft( state, siteId );

	if ( trialDaysLeft === null ) {
		return null;
	}

	return trialDaysLeft <= 0;
}
