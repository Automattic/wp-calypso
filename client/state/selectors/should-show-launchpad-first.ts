import config from '@automattic/calypso-config';
import { SiteDetails } from '@automattic/data-stores';

/**
 * Determines if the launchpad should be shown first based on site createion flow
 * @param {SiteDetails|undefined} site Site object
 * @returns {boolean} Whether launchpad should be shown first
 */
export const shouldShowLaunchpadFirst = ( site: SiteDetails ) => {
	const wasSiteCreatedOnboardingFlow = site?.options?.site_creation_flow === 'onboarding';
	const isLaunchpadFirstEnabled = config.isEnabled( 'home/launchpad-first' );

	return wasSiteCreatedOnboardingFlow && isLaunchpadFirstEnabled;
};

export default shouldShowLaunchpadFirst;
