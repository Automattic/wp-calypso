import { useLaunchpad } from '@automattic/data-stores';
import { shouldShowLaunchpadFirst } from '../../../state/selectors/should-show-launchpad-first';
import type { SiteExcerptData } from '@automattic/sites';

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
