import { CONCIERGE_INITIAL_REQUEST, CONCIERGE_INITIAL_UPDATE } from 'calypso/state/action-types';

export const availableSessions = ( state = [], action ) => {
	switch ( action.type ) {
		case CONCIERGE_INITIAL_REQUEST:
			return [];
		case CONCIERGE_INITIAL_UPDATE: {
			const { initial } = action;
			return initial.availableSessions || [];
		}
	}

	return state;
};

export default availableSessions;
