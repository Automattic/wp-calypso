/**
 * External Dependencies
 */
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

/**
 * Internal Dependencies
 */
import { fetchExperiments } from 'calypso/state/data-layer/wpcom/experiments';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getVariationForUser, isLoading, nextRefresh } from './selectors';

/**
 * Keeps track of whether an event has fired to generate an anonId
 * Internal state not to be used anywhere else
 */
let hasAnonIdGeneratingTracksEventFired = false;

/**
 * Gets (and initialises if not yet initialised) a user's assignment to an experiment.
 *
 * Usage tips:
 * - Account for loading state as assignment is now server-side.
 * - Account for null variations: Provide the fallback experience.
 *
 * See the README for more info
 *
 * @param experimentName The name of the experiment
 *
 * @returns [isVariationLoading, variation]
 */
export function useExperiment( experimentName: string ): [ boolean, string | null ] {
	const dispatch = useDispatch();

	const { variation, isLoading: isVariationLoading, updateAfter } = useSelector( ( state ) => ( {
		variation: getVariationForUser( state, experimentName ),
		isLoading: isLoading( state ),
		updateAfter: nextRefresh( state ),
	} ) );

	// HACK:
	// Due to a temporary issue on the backend we have to get and assign all experiments at once.
	//
	// updateAfter is used to periodically refresh the assignments in the case of long running sessions.
	// It is just the last fetch time + 1000
	useEffect( () => {
		// Due to how tracks works, we need to ensure that an event has been fired at least once to have an anonId.
		if ( ! hasAnonIdGeneratingTracksEventFired ) {
			recordTracksEvent( 'calypso_experiment_first_session_assignment', {
				experiment_name: experimentName,
			} );
			hasAnonIdGeneratingTracksEventFired = true;
		}

		if ( updateAfter < Date.now() ) {
			dispatch( fetchExperiments() );
		}
	}, [ updateAfter ] );

	if ( ! experimentName ) {
		if ( ! process.env.NODE_ENV || process.env.NODE_ENV === 'development' ) {
			throw 'Experiment name is not defined!';
		}
		// TODO: LogStash if missing an experiment name
		return [ false, null ];
	}

	return [ isVariationLoading, variation ];
}
