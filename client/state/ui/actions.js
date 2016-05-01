/**
 * Internal dependencies
 */
import {
	SELECTED_SITE_SET,
	SET_SECTION,
	GUIDED_TOUR_SHOW,
	GUIDED_TOUR_UPDATE,
} from 'state/action-types';

import {
	withAnalytics,
	recordTracksEvent,
} from 'state/analytics/actions';

import guidedToursConfig from 'layout/guided-tours/config';

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
export function showGuidedTour( { shouldShow, shouldDelay = false, tour = 'main' } ) {
	const showAction = {
		type: GUIDED_TOUR_SHOW,
		shouldShow,
		shouldDelay,
		tour,
	};

	const trackEvent = recordTracksEvent( 'calypso_guided_tours_show', {
		tour_version: guidedToursConfig.version,
		tour,
	} );

	return withAnalytics( trackEvent, showAction );
}

export function quitGuidedTour( { tour = 'main', stepName, finished } ) {
	const quitAction = {
		type: GUIDED_TOUR_UPDATE,
		shouldShow: false,
		shouldReallyShow: false,
		shouldDelay: false,
		tour,
		stepName,
	};

	const trackEvent = recordTracksEvent( `calypso_guided_tours_${ finished ? 'finished' : 'quit' }`, {
		step: stepName,
		tour_version: guidedToursConfig.version,
		tour,
	} );

	return withAnalytics( trackEvent, quitAction );
}
export function nextGuidedTourStep( { tour = 'main', stepName } ) {
	const nextAction = {
		type: GUIDED_TOUR_UPDATE,
		stepName,
	};

	const trackEvent = recordTracksEvent( 'calypso_guided_tours_next_step', {
		step: stepName,
		tour_version: guidedToursConfig.version,
		tour,
	} );

	return withAnalytics( trackEvent, nextAction );
}
