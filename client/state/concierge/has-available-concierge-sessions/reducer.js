/**
 * Internal dependencies
 */
import { withoutPersistence } from 'state/utils';
import { CONCIERGE_INITIAL_REQUEST, CONCIERGE_INITIAL_UPDATE } from 'state/action-types';

export const hasAvailableConciergeSessions = withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case CONCIERGE_INITIAL_REQUEST:
			return null;
		case CONCIERGE_INITIAL_UPDATE: {
			const { initial } = action;
			return initial.hasAvailableConciergeSessions;
		}
	}

	return state;
} );

export default hasAvailableConciergeSessions;
