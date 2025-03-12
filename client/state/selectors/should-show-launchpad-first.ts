import { Onboard } from '@automattic/data-stores';
import type { SiteExcerptData } from '@automattic/sites';

const SiteIntent = Onboard.SiteIntent;

/**
 * Determines if the launchpad should be shown first based on site createion flow
 * @param site Site object
 * @returns Whether launchpad should be shown first
 */
export const shouldShowLaunchpadFirst = ( site: SiteExcerptData ): boolean => {
	const wasSiteCreatedOnboardingFlow = site.options?.site_creation_flow === 'onboarding';
	const isBigSkyIntent = site?.options?.site_intent === SiteIntent.AIAssembler;

	if ( isBigSkyIntent || ! wasSiteCreatedOnboardingFlow ) {
		return false;
	}

	return true;
};
