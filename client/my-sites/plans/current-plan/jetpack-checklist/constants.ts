/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { SiteSlug, URL } from 'types';

/**
 * Returns the localized duration of a task in given minutes.
 *
 * @param  minutes Number of minutes.
 * @return Localized duration.
 */
export function getJetpackChecklistTaskDuration( minutes: number ): string {
	return translate( '%d minute', '%d minutes', { count: minutes, args: [ minutes ] } );
}

interface TaskUiDescription {
	readonly id?: string;
	readonly title: string;
	readonly description?: string;
	readonly completedButtonText: string;
	readonly completedTitle?: string;
	readonly getUrl: ( siteSlug: SiteSlug, isComplete?: boolean ) => URL;
	readonly duration?: string;
	readonly tourId?: string;
}

export interface ChecklistTasksetUi {
	[taskId: string]: TaskUiDescription;
}
