/**
 * Internal dependencies
 */

import { get, includes, reduce } from 'lodash';

export const APP_BANNER_DISMISS_TIMES_PREFERENCE = 'appBannerDismissTimes';
export const EDITOR = 'post-editor';
export const GUTENBERG = 'gutenberg-editor';
export const NOTES = 'notifications';
export const READER = 'reader';
export const STATS = 'stats';
export const ALLOWED_SECTIONS = [ EDITOR, GUTENBERG, NOTES, READER, STATS ];
export const ONE_WEEK_IN_MILLISECONDS = 604800000;
export const ONE_MONTH_IN_MILLISECONDS = 2419200000; // 28 days

export function getAppBannerData( translate, sectionName ) {
	switch ( sectionName ) {
		case EDITOR:
		case GUTENBERG:
			return {
				title: translate( 'Rich mobile publishing.' ),
				copy: translate(
					'A streamlined editor with faster, simpler image uploading? Check and mate.'
				),
			};
		case NOTES:
			return {
				title: translate( 'Watch engagement happening.' ),
				copy: translate(
					'Is your new post a hit? With push notifications, see reactions as they roll in.'
				),
			};
		case READER:
			return {
				title: translate( 'Read posts, even offline.' ),
				copy: translate( 'Catch up with new posts on the go or save them to read offline.' ),
			};
		case STATS:
			return {
				title: translate( 'Stats at your fingertips.' ),
				copy: translate( 'See your real-time stats anytime, anywhere.' ),
			};
		default:
			return {
				title: '',
				copy: '',
			};
	}
}

export function getCurrentSection( currentSection, isNotesOpen, currentRoute ) {
	if ( isNotesOpen ) {
		return NOTES;
	}

	if ( currentRoute && currentRoute.indexOf( '/stats/activity/' ) !== -1 ) {
		//don't show app banner in activity log
		return null;
	}

	if ( includes( ALLOWED_SECTIONS, currentSection ) ) {
		return currentSection;
	}

	return null;
}

export function getNewDismissTimes( dismissedSection, currentDismissTimes ) {
	const currentTime = Date.now();
	const aWeekFromNow = currentTime + ONE_WEEK_IN_MILLISECONDS;
	const aMonthFromNow = currentTime + ONE_MONTH_IN_MILLISECONDS;

	return reduce(
		ALLOWED_SECTIONS,
		( result, section ) => {
			if ( section === dismissedSection ) {
				// Dismiss selected section for a month.
				result[ section ] = aMonthFromNow;
			} else {
				// Dismiss all other sections for a week, but make sure that we preserve previous dismiss time
				// if it was longer than that (e.g. if other section was also dismissed for a month).
				result[ section ] =
					get( currentDismissTimes, section, -Infinity ) > aWeekFromNow
						? get( currentDismissTimes, section )
						: aWeekFromNow;
			}

			return result;
		},
		{}
	);
}

export const isDismissed = ( dismissedUntil, section ) =>
	get( dismissedUntil, section, -Infinity ) > Date.now();
