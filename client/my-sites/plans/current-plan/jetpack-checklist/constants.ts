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

export const JETPACK_PERFORMANCE_CHECKLIST_TASKS: Readonly< ChecklistTasksetUi > = {
	jetpack_site_accelerator: {
		title: translate( 'Site Accelerator' ),
		description: translate(
			'Serve your images and static files through our global CDN and watch your page load time drop.'
		),
		getUrl: siteSlug => `/settings/performance/${ siteSlug }`,
		completedButtonText: translate( 'Configure' ),
		completedTitle: translate(
			'Site accelerator is serving your images and static files through our global CDN.'
		),
		duration: getJetpackChecklistTaskDuration( 1 ),
		tourId: 'jetpackSiteAccelerator',
	},
	jetpack_lazy_images: {
		title: translate( 'Lazy Load Images' ),
		description: translate(
			"Improve your site's speed by only loading images when visible on the screen."
		),
		getUrl: ( siteSlug, isComplete ) =>
			isComplete ? `/media/${ siteSlug }` : `/settings/performance/${ siteSlug }`,
		completedButtonText: translate( 'Upload images' ),
		completedTitle: translate( 'Lazy load images is improving your site speed.' ),
		duration: getJetpackChecklistTaskDuration( 1 ),
		tourId: 'jetpackLazyImages',
	},
};
