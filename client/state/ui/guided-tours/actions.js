/**
 * Internal dependencies
 */
import {
	SHOW_GUIDED_TOUR,
	UPDATE_GUIDED_TOUR,
} from 'state/action-types';

import {
	withAnalytics,
	recordTracksEvent,
} from 'state/analytics/actions';

import guidedToursConfig from 'layout/guided-tours/config';

/**
 * Returns an action object which will be used to hide or show a specific tour.
 *
 * @param {Object} options Options object, see fn signature.
 * @return {Object} Action object
 */
export function showGuidedTour( { shouldShow, shouldDelay = false, tour = 'main' } ) {
	const showAction = {
		type: SHOW_GUIDED_TOUR,
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
		type: UPDATE_GUIDED_TOUR,
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
		type: UPDATE_GUIDED_TOUR,
		stepName,
	};

	const trackEvent = recordTracksEvent( 'calypso_guided_tours_next_step', {
		step: stepName,
		tour_version: guidedToursConfig.version,
		tour,
	} );

	return withAnalytics( trackEvent, nextAction );
}
