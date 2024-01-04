import { get, includes, reduce } from 'lodash';

export const APP_BANNER_DISMISS_TIMES_PREFERENCE = 'appBannerDismissTimes';
export const GUTENBERG = 'gutenberg-editor';
export const NOTES = 'notifications';
export const READER = 'reader';
export const STATS = 'stats';
export const HOME = 'home';
export const ALLOWED_SECTIONS = [ GUTENBERG, NOTES, READER, STATS, HOME ];
export const ONE_WEEK_IN_MILLISECONDS = 604800000;
export const ONE_MONTH_IN_MILLISECONDS = 2419200000; // 28 days

// Experiment Configuration
export const TWO_WEEKS_IN_MILLISECONDS = 1209600000;
export const ONE_DAY_IN_MILLISECONDS = 86400000;

const emptyBanner = {
	title: '',
	copy: '',
	icon: '',
};

export function getAppBannerData( translate, sectionName, isRTL ) {
	switch ( sectionName ) {
		case GUTENBERG:
			return {
				title: translate( 'Rich mobile publishing' ),
				copy: translate(
					'A streamlined editor with faster, simpler image uploading? Check and mate.'
				),
				icon: `/calypso/animations/app-promo/wp-to-jp${ isRTL ? '-rtl' : '' }.json`,
			};
		case NOTES:
			return {
				title: translate( 'Watch engagement happening' ),
				copy: translate(
					'Is your new post a hit? With push notifications, see reactions as they roll in.'
				),
				icon: `/calypso/animations/app-promo/jp-notifications${ isRTL ? '-rtl' : '' }.json`,
			};
		case READER:
			return {
				title: translate( 'Read posts, even offline' ),
				copy: translate( 'Catch up with new posts on the go or save them to read offline.' ),
				icon: `/calypso/animations/app-promo/jp-reader${ isRTL ? '-rtl' : '' }.json`,
			};
		case STATS:
			return {
				title: translate( 'Stats at your fingertips' ),
				copy: translate( 'See your real-time stats anytime, anywhere.' ),
				icon: `/calypso/animations/app-promo/jp-stats${ isRTL ? '-rtl' : '' }.json`,
			};
		case HOME:
			return {
				title: translate( 'The Jetpack app makes WordPress better' ),
				copy: translate( 'Everything you need to write, publish, and manage a world-class site.' ),
				icon: `/calypso/animations/app-promo/wp-to-jp${ isRTL ? '-rtl' : '' }.json`,
			};
		default:
			return emptyBanner;
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

function getDismissTimes() {
	const currentTime = Date.now();
	const longerTime = TWO_WEEKS_IN_MILLISECONDS;
	const shorterTime = ONE_DAY_IN_MILLISECONDS;

	return {
		longerDuration: currentTime + longerTime,
		shorterDuration: currentTime + shorterTime,
	};
}

export function getNewDismissTimes( dismissedSection, currentDismissTimes ) {
	const dismissTimes = getDismissTimes();

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
