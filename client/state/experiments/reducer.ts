/**
 * External Dependencies
 */
import { Action } from 'redux';

/**
 * Internal Dependencies
 */
import { EXPERIMENT_FETCH, EXPERIMENT_ASSIGN } from 'state/action-types';
import { ExperimentState, ExperimentAssign } from 'state/experiments/types';
import { tracksAnonymousUserId } from 'lib/analytics/ad-tracking';

/**
 * Attempt to get the anon id for the user, if set
 */
export function getAnonIdFromCookie(): string | null {
	const id = tracksAnonymousUserId();

	return id == null || id === '' ? null : id;
}

const appStartedAt = Date.now();

const resetState: ( anonId: string | null ) => ExperimentState = anonId => ( {
	anonId,
	isLoading: true,
	nextRefresh: appStartedAt,
	variations: null,
} );

export default function reducer(
	state: ExperimentState = resetState( getAnonIdFromCookie() ),
	action: Action
) {
	switch ( action.type ) {
		/**
		 * Store the user's assignment from the API
		 */
		case EXPERIMENT_ASSIGN:
			return {
				...state,
				isLoading: false,
				variations: ( action as ExperimentAssign ).variations,
				nextRefresh: ( action as ExperimentAssign ).nextRefresh,
			};

		/**
		 * Start retrieving the user's assignment from the API
		 */
		case EXPERIMENT_FETCH:
			return {
				...state,
				isLoading: true,
			};
		default:
			return state;
	}
}
