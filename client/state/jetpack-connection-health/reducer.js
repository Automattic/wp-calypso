import { withStorageKey } from '@automattic/state-utils';
import {
	JETPACK_CONNECTION_HEALTHY,
	JETPACK_CONNECTION_MAYBE_UNHEALTHY,
} from 'calypso/state/action-types';

export const jetpackConnectionHealth = ( state = {}, action ) => {
	switch ( action.type ) {
		case JETPACK_CONNECTION_HEALTHY: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					jetpack_connection_problem: false,
				},
			};
		}

		case JETPACK_CONNECTION_MAYBE_UNHEALTHY: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					jetpack_connection_problem: true,
				},
			};
		}
	}

	return state;
};

export default withStorageKey( 'jetpackConnectionHealth', jetpackConnectionHealth );
