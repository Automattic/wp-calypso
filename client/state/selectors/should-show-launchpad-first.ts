import { Onboard } from '@automattic/data-stores';
import type { SiteExcerptData } from '@automattic/sites';

const SiteIntent = Onboard.SiteIntent;

/**
 * Determines if the launchpad should be shown first based on site creation flow.
 * @param site Site object
 * @returns Whether launchpad should be shown first
 */
export const shouldShowLaunchpadFirst = ( site: SiteExcerptData ): boolean => {
	const wasSupportedCreationFlow = [ 'onboarding', 'newsletter' ].includes(
		site.options?.site_creation_flow || ''
	);
	const isBigSkyIntent = site?.options?.site_intent === SiteIntent.AIAssembler;
	const isMigrationIntent = site?.options?.site_intent === SiteIntent.SiteMigration;
	// If we don't have a site intent, fall through to the next option.
	const siteHasNoIntent =
		site && site.options && ( site.options.site_intent === '' || ! site.options.site_intent );

	if ( isBigSkyIntent || ! wasSupportedCreationFlow || siteHasNoIntent || isMigrationIntent ) {
		return false;
	}

	return true;
};
