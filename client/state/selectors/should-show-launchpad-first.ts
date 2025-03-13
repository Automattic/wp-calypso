import { Onboard, useLaunchpad } from '@automattic/data-stores';
import type { SiteExcerptData } from '@automattic/sites';

const SiteIntent = Onboard.SiteIntent;

/**
 * Determines if the launchpad should be shown first based on site creation flow.
 * @param site Site object
 * @returns Whether launchpad should be shown first
 */
export const shouldShowLaunchpadFirst = ( site: SiteExcerptData ): boolean => {
	const wasSiteCreatedOnboardingFlow = site.options?.site_creation_flow === 'onboarding';
	const isBigSkyIntent = site?.options?.site_intent === SiteIntent.AIAssembler;
	// If we don't have a site intent, fall through to the next option.
	const siteHasNoIntent =
		site && site.options && ( site.options.site_intent === '' || ! site.options.site_intent );

	if ( isBigSkyIntent || ! wasSiteCreatedOnboardingFlow || siteHasNoIntent ) {
		return false;
	}

	return true;
};

/**
 * Determines if the launchpad should be shown first based on site creation flow using a hook.
 * @param site Site object
 * @returns Whether launchpad should be shown first
 */
export const useShouldShowLaunchpadFirst = ( site: SiteExcerptData ): boolean => {
	const launchpadContext = 'focused-customer-home';
	const checklistSlug = site?.options?.site_intent ?? '';

	const { data: launchpadData } = useLaunchpad(
		site?.ID ?? null,
		checklistSlug,
		{},
		launchpadContext
	);

	if ( ! shouldShowLaunchpadFirst( site ) ) {
		return false;
	}

	// If the launchpad checklist is null (loading state) we'll show the Focused Launchpad loading state
	// If it's loaded and empty we'll hide the Focused Launchpad
	return launchpadData.checklist === null || ( launchpadData.checklist?.length ?? 0 ) > 0;
};
