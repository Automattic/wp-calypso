import { type SiteDetails, type ChecklistStatuses } from '@automattic/data-stores';
import { isStartWritingFlow, isReadymadeFlow } from '@automattic/onboarding';
import { LaunchpadChecklist } from './types';

export function isDomainUpsellCompleted(
	site: SiteDetails | null,
	checklistStatuses?: ChecklistStatuses
): boolean {
	return ! site?.plan?.is_free || checklistStatuses?.domain_upsell_deferred === true;
}

export const getSiteIdOrSlug = (
	flow: string,
	site: SiteDetails | null,
	siteSlug?: string | null
) => {
	return isStartWritingFlow( flow ) || isReadymadeFlow( flow )
		? { siteId: site?.ID }
		: { siteSlug };
};

/*
 * Confirms if final task for a given site_intent is completed.
 * This is used to as a fallback check to determine if the full
 * screen launchpad should be shown or not.
 *
 * @param {LaunchpadChecklist} checklist - The list of tasks for a site's launchpad
 * @param {boolean} isSiteLaunched - The value of a site's is_launched option
 * @returns {boolean} - True if the final task for the given site checklist is completed
 */
export function areLaunchpadTasksCompleted(
	checklist: LaunchpadChecklist | null | undefined,
	isSiteLaunched: boolean
) {
	if ( ! checklist || ! Array.isArray( checklist ) ) {
		return false;
	}

	const lastTask = checklist[ checklist.length - 1 ];

	// If last task is site_launched and if site is launched, return true
	// Else return the status of the last task
	if ( lastTask?.id === 'site_launched' && isSiteLaunched ) {
		return true;
	}

	return lastTask?.completed;
}
