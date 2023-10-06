import { isEnabled } from '@automattic/calypso-config';

export const isUserEligibleForFreeHostingTrial = () => {
	/**
	 * TODO: Possible criteria
	 * - if the user has tried the platform already
	 * - maybe if they already have a paid site
	 */
	return isEnabled( 'plans/hosting-trial' );
};
