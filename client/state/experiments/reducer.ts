/**
 * External Dependencies
 */
import { findIndex, tail } from 'lodash';
import { Action } from 'redux';

/**
 * Internal Dependencies
 */
import { EXPERIMENT_FETCH, EXPERIMENT_ASSIGN, CURRENT_USER_RECEIVE } from 'state/action-types';
import { ExperimentState, ExperimentAssign } from 'state/experiments/types';

/**
 * Attempt to get the anon id for the user, if set
 */
function getAnonIdFromCookie(): string | null {
	if ( document && document.cookie != null ) {
		const cookieString = document.cookie;
		const rawCookies = cookieString.split( ';' );
		const anonCookieIndex = findIndex( rawCookies, c =>
			c
				.trim()
				.toLowerCase()
				.startsWith( 'tk_ai=' )
		);
		if ( anonCookieIndex === -1 ) return null;

		const anonIdCookie = rawCookies[ anonCookieIndex ];
		const anonIdTuple = anonIdCookie.split( '=' );

		if ( anonIdTuple.length === 2 ) return anonIdTuple[ 1 ] === '' ? null : anonIdTuple[ 1 ];
		if ( anonIdTuple.length > 2 ) return tail( anonIdTuple ).join( '=' );
	}
	return null;
}

const appStartedAt = Date.now();

const resetState: ( anonId: string | null ) => ExperimentState = anonId => ( {
	anonId,
	isLoading: true,
	nextRefresh: appStartedAt,
	tests: null,
} );

export default function reducer( state: ExperimentState = resetState( null ), action: Action ) {
	switch ( action.type ) {
		/**
		 * Store the anon id when we first load the application
		 */
		case '@@INIT':
			state.anonId = getAnonIdFromCookie();
			break;

		/**
		 * Store the user's assignment from the API
		 */
		case EXPERIMENT_ASSIGN:
			state = {
				...state,
				isLoading: false,
				tests: ( action as ExperimentAssign ).tests,
				nextRefresh: ( action as ExperimentAssign ).nextRefresh,
			};
			break;

		/**
		 * Start retrieving the user's assignment from the API
		 */
		case EXPERIMENT_FETCH:
			state.isLoading = true;
			break;

		/**
		 * When the user changes, we need to redetermine assigned variations
		 */
		case CURRENT_USER_RECEIVE:
			state = resetState( state.anonId );
			break;
	}

	return state;
}
