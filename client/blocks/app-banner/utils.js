import { get, includes, reduce } from 'lodash';

export const APP_BANNER_DISMISS_TIMES_PREFERENCE = 'appBannerDismissTimes';
export const GUTENBERG = 'gutenberg-editor';
export const NOTES = 'notifications';
export const READER = 'reader';
export const STATS = 'stats';
export const ALLOWED_SECTIONS = [ GUTENBERG, NOTES, READER, STATS ];
export const ONE_WEEK_IN_MILLISECONDS = 604800000;
export const ONE_MONTH_IN_MILLISECONDS = 2419200000; // 28 days

// Experiment Configuration
export const TWO_WEEKS_IN_MILLISECONDS = 1209600000;
export const ONE_DAY_IN_MILLISECONDS = 86400000;

export function getAppBannerData( translate, sectionName ) {
	switch ( sectionName ) {
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

export function getCurrentSection( currentSection, isNotesOpen ) {
	if ( isNotesOpen ) {
		return NOTES;
	}

	if ( includes( ALLOWED_SECTIONS, currentSection ) ) {
		return currentSection;
	}

	return null;
}

function getDismissTimes( isControl ) {
	const currentTime = Date.now();
	const longerTime = isControl ? ONE_MONTH_IN_MILLISECONDS : TWO_WEEKS_IN_MILLISECONDS;
	const shorterTime = isControl ? ONE_WEEK_IN_MILLISECONDS : ONE_DAY_IN_MILLISECONDS;

	return {
		longerDuration: currentTime + longerTime,
		shorterDuration: currentTime + shorterTime,
	};
}

export function getNewDismissTimes( dismissedSection, currentDismissTimes, isControl ) {
	const dismissTimes = getDismissTimes( isControl );

	return reduce(
		ALLOWED_SECTIONS,
		( result, section ) => {
			if ( section === dismissedSection ) {
				// Dismiss selected section for a longer period.
				result[ section ] = dismissTimes.longerDuration;
			} else {
				// Dismiss all other sections for a shorter period, but make sure that we preserve previous dismiss time
				// if it was longer than that (e.g. if other section was also dismissed for a month).
				result[ section ] =
					get( currentDismissTimes, section, -Infinity ) > dismissTimes.shorterDuration
						? get( currentDismissTimes, section )
						: dismissTimes.shorterDuration;
			}

			return result;
		},
		{}
	);
}

export const isDismissed = ( dismissedUntil, section ) =>
	get( dismissedUntil, section, -Infinity ) > Date.now();
