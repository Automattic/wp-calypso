/**
 * Internal dependencies
 */
import {
	GUIDED_TOUR_UPDATE,
	GUIDED_TOUR_PAUSE,
	GUIDED_TOUR_RESUME,
} from 'calypso/state/action-types';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';

import 'calypso/state/guided-tours/init';

export function quitGuidedTour( { tour, stepName, finished } ) {
	const quitAction = {
		type: GUIDED_TOUR_UPDATE,
		shouldShow: false,
		shouldReallyShow: false,
		tour,
		stepName,
		finished,
	};

	return ( dispatch, getState ) => {
		dispatch( addSeenGuidedTour( getState, tour, finished ) );
		dispatch( quitAction );
	};
}

export function nextGuidedTourStep( { tour, stepName } ) {
	return {
		type: GUIDED_TOUR_UPDATE,
		tour,
		stepName,
		isPaused: false,
	};
}

export function requestGuidedTour( tour ) {
	return nextGuidedTourStep( { tour, stepName: 'init' } );
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
		},
	] );
}

export function resetGuidedToursHistory() {
	return savePreference( 'guided-tours-history', [] );
}

export function pauseGuidedTour() {
	return {
		type: GUIDED_TOUR_PAUSE,
		isPaused: true,
	};
}

export function resumeGuidedTour() {
	return {
		type: GUIDED_TOUR_RESUME,
		isPaused: false,
	};
}
