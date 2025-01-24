import config from '@automattic/calypso-config';

/**
 * Determines if the launchpad should be shown first based on site createion flow
 * @param {string|undefined} siteCreationFlow Site creation flow
 * @returns {boolean} Whether launchpad should be shown first
 */
export const shouldShowLaunchpadFirst = ( siteCreationFlow ) => {
	const wasSiteCreatedOnboardingFlow = siteCreationFlow === 'onboarding';
	const isLaunchpadFirstEnabled = config.isEnabled( 'home/launchpad-first' );

	return wasSiteCreatedOnboardingFlow && isLaunchpadFirstEnabled;
};

export default shouldShowLaunchpadFirst;
