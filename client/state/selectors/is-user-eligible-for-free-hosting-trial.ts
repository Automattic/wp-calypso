import { AppState } from '../../types';

export const FREE_HOSTING_TRIAL_ENABLED = false;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const isUserEligibleForFreeHostingTrial = ( _state: AppState ) => {
	/**
	 * Disable free hosting trials - see pMz3w-k4H-p2#comment-119368
	 * See https://github.com/Automattic/wp-calypso/pull/102659/files#diff-5bf70c26edb1f5ec4791ff1d23f8bcf214b047ee08c9462549865d1f59bf92c5
	 * for how to restore the eligibility check.
	 */
	return FREE_HOSTING_TRIAL_ENABLED;
};
