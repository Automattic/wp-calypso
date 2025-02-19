import config from '@automattic/calypso-config';
import { SiteDetails, Onboard } from '@automattic/data-stores';

const SiteIntent = Onboard.SiteIntent;

/**
 * Determines if the launchpad should be shown first based on site createion flow
 * @param {SiteDetails|undefined} site Site object
 * @returns {boolean} Whether launchpad should be shown first
 */
export const shouldShowLaunchpadFirst = ( site: SiteDetails ) => {
	const isLaunchpadFirstEnabled = config.isEnabled( 'home/launchpad-first' );
	const wasSiteCreatedOnboardingFlow = site?.options?.site_creation_flow === 'onboarding';
	const isNotBigSkyIntent = site?.options?.site_intent !== SiteIntent.AIAssembler;

	return isLaunchpadFirstEnabled && wasSiteCreatedOnboardingFlow && isNotBigSkyIntent;
};

export default shouldShowLaunchpadFirst;
