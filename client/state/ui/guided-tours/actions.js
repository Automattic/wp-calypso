/**
 * Internal dependencies
 */
import {
	GUIDED_TOUR_UPDATE,
} from 'state/action-types';

import {
	withAnalytics,
	recordTracksEvent,
} from 'state/analytics/actions';

import guidedToursConfig from 'layout/guided-tours/config';
import { savePreference } from 'state/preferences/actions';
import { getPreference } from 'state/preferences/selectors';

export function quitGuidedTour( { tour, stepName, finished, error } ) {
	const quitAction = {
		type: GUIDED_TOUR_UPDATE,
		shouldShow: false,
		shouldReallyShow: false,
		tour,
		stepName,
		finished,
	};

	const trackEvent = recordTracksEvent( `calypso_guided_tours_${ finished ? 'finished' : 'quit' }`, {
		step: stepName,
		tour_version: guidedToursConfig.get( tour ).meta.version,
		tour,
		error,
	} );

	return ( dispatch, getState ) => {
		dispatch( addSeenGuidedTour( getState, tour, finished ) );
		dispatch( withAnalytics( trackEvent, quitAction ) );
	};
}

export function nextGuidedTourStep( { tour, stepName } ) {
	const nextAction = {
		type: GUIDED_TOUR_UPDATE,
		tour,
		stepName,
	};

	const trackEvent = recordTracksEvent( 'calypso_guided_tours_next_step', {
		step: stepName,
		tour_version: guidedToursConfig.get( tour ).meta.version,
		tour,
	} );

	return withAnalytics( trackEvent, nextAction );
}

// TODO(mcsf): come up with a much better (read: safer) solution
//
// The way we persist which tours have been seen by the user is subject to
// concurrency issues and history loss, since adding a tour to that collection
// is actually achieved by adding a tour to the client's copy of the collection
// and saving that as the new history.

function addSeenGuidedTour( getState, tourName, finished = false ) {
	return savePreference( 'guided-tours-history', [
		...getPreference( getState(), 'guided-tours-history' ),
		{
			timestamp: Date.now(),
			tourName,
			finished,
		}
	] );
}
