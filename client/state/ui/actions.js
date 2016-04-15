/**
 * Internal dependencies
 */
import {
	SELECTED_SITE_SET,
	SET_SECTION,
	SHOW_GUIDESTOUR,
	UPDATE_GUIDESTOUR,
} from 'state/action-types';

import {
	withAnalytics,
	recordTracksEvent,
} from 'state/analytics/actions';

/**
 * Returns an action object to be used in signalling that a site has been set
 * as selected.
 *
 * @param  {Number} siteId Site ID
 * @return {Object}        Action object
 */
export function setSelectedSiteId( siteId ) {
	return {
		type: SELECTED_SITE_SET,
		siteId
	};
}

/**
 * Returns an action object to be used in signalling that all sites have been
 * set as selected.
 *
 * @return {Object}        Action object
 */
export function setAllSitesSelected() {
	return {
		type: SELECTED_SITE_SET,
		siteId: null
	};
}

export function setSection( section, options = {} ) {
	options.type = SET_SECTION;
	if ( section ) {
		options.section = section;
	}
	options.hasSidebar = ( options.hasSidebar === false ) ? false : true;
	return options;
}

/**
 * Returns an action object which will be used to hide or show a specific tour.
 *
 * @param {Object} options Options object, see fn signature.
 * @return {Object} Action object
 */
export function showGuidesTour( { shouldShow, shouldDelay = false, tour = 'main' } ) {
	const showAction = {
		type: SHOW_GUIDESTOUR,
		shouldShow,
		shouldDelay,
		tour,
	};

	const trackEvent = recordTracksEvent( 'calypso_guided_tours_show', {
		tour,
	} );

	return withAnalytics( trackEvent, showAction );
}

export function quitGuidesTour( { tour = 'main', stepName, finished } ) {
	const quitAction = {
		type: UPDATE_GUIDESTOUR,
		shouldShow: false,
		shouldReallyShow: false,
		shouldDelay: false,
		tour,
		stepName,
	};

	const trackEvent = recordTracksEvent( `calypso_guided_tours_${ finished ? 'finished' : 'quit' }`, {
		step: stepName,
		tour,
	} );

	return withAnalytics( trackEvent, quitAction );
}
export function nextGuidesTourStep( { tour = 'main', stepName } ) {
	const nextAction = {
		type: UPDATE_GUIDESTOUR,
		stepName,
	};

	const trackEvent = recordTracksEvent( 'calypso_guided_tours_next_step', {
		step: stepName,
		tour,
	} );

	return withAnalytics( trackEvent, nextAction );
}
