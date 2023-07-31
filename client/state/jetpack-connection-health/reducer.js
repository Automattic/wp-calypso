import { withStorageKey } from '@automattic/state-utils';
import {
	JETPACK_CONNECTION_HEALTHY,
	JETPACK_CONNECTION_MAYBE_UNHEALTHY,
	JETPACK_CONNECTION_UNHEALTHY,
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
					is_healthy: true,
					error: '',
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

		case JETPACK_CONNECTION_UNHEALTHY: {
			const { siteId, errorCode } = action;

			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					jetpack_connection_problem: true,
					is_healthy: false,
					error: errorCode,
				},
			};
		}
	}

	return state;
};

export default withStorageKey( 'jetpackConnectionHealth', jetpackConnectionHealth );
