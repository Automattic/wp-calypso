/**
 * Internal dependencies
 */
import { AUTH_ATTEMPS_TTL } from '../constants';
import { isStale } from '../utils';
import {
	JETPACK_CONNECT_COMPLETE_FLOW,
	JETPACK_CONNECT_RETRY_AUTH,
} from 'calypso/state/jetpack-connect/action-types';
import { jetpackAuthAttemptsSchema } from './schema';
import { keyedReducer, withSchemaValidation } from 'calypso/state/utils';

export function authAttempts( state = undefined, { type, attemptNumber } ) {
	switch ( type ) {
		case JETPACK_CONNECT_RETRY_AUTH:
			if ( ! state || isStale( state.timestamp, AUTH_ATTEMPS_TTL ) ) {
				return {
					attempt: 0,
					timestamp: Date.now(),
				};
			}
			return {
				attempt: attemptNumber,
				timestamp: state.timestamp,
			};

		case JETPACK_CONNECT_COMPLETE_FLOW:
			return undefined;
	}
	return state;
}

export const reducer = withSchemaValidation(
	jetpackAuthAttemptsSchema,
	keyedReducer( 'slug', authAttempts )
);

export default reducer;
