/**
 * Internal dependencies
 */
import {
	startsWith,
	get,
	reduce,
} from 'lodash';

export const EDITOR = 'editor';
export const NOTES = 'notifications';
export const READER = 'reader';
export const STATS = 'stats';
export const ALLOWED_PAGE_TYPES = [ EDITOR, NOTES, READER, STATS ];
export const ONE_WEEK_IN_MILLISECONDS = 604800000;
export const ONE_YEAR_IN_MILLISECONDS = 31540000000;

export function getAppBannerData( translate, pageType ) {
	switch ( pageType ) {
		case EDITOR:
			return {
				title: translate( 'Rich mobile publishing.' ),
				copy: translate( 'A streamlined editor with faster, simpler image uploading? Check and mate.' ),
			};
		case NOTES:
			return {
				title: translate( 'Watch engagement happening.' ),
				copy: translate( 'Is your new post a hit? With push notifications, see reactions as they roll in.' ),
			};
		case READER:
			return {
				title: translate( 'Read online or off.' ),
				copy: translate( 'Catch up with new posts when you have time, even if you are offline.' ),
			};
		case STATS:
			return {
				title: translate( 'Stats at your fingertips.' ),
				copy: translate( "Add real-time stats to your device's notifications or widgets." ),
			};
		default:
			return {
				title: '',
				copy: '',
			};
	}
}

export function getPageType( currentPath, isNotesOpen ) {
	if ( ! currentPath ) {
		return null;
	}

	if ( isNotesOpen ) {
		return NOTES;
	}

	if ( startsWith( currentPath, '/post/' ) || startsWith( currentPath, '/page/' ) ) {
		return EDITOR;
	}

	if ( currentPath === '/' ) {
		return READER;
	}

	if ( startsWith( currentPath, '/stats/' ) ) {
		return STATS;
	}

	return null;
}

export function getNewDismissTimes( pageType ) {
	const currentTime = Date.now();
	const aWeekFromNow = currentTime + ONE_WEEK_IN_MILLISECONDS;
	const aYearFromNow = currentTime + ONE_YEAR_IN_MILLISECONDS;

	return reduce( ALLOWED_PAGE_TYPES, ( result, type ) => {
		result[ type ] = ( type === pageType ) ? aYearFromNow : aWeekFromNow;
		return result;
	}, {} );
}

export function isDismissed( dismissedUntil, pageType ) {
	if ( ! get( dismissedUntil, pageType, false ) ) {
		return false;
	}

	return dismissedUntil[ pageType ] > Date.now();
}
