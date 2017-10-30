/** @format */
/**
 * Internal dependencies
 */
import { AUTH_ATTEMPS_TTL } from '../constants';
import { isStale } from '../utils';
import { JETPACK_CONNECT_COMPLETE_FLOW, JETPACK_CONNECT_RETRY_AUTH } from 'state/action-types';
import { jetpackAuthAttemptsSchema } from './schema';

export default function jetpackAuthAttempts( state = {}, action ) {
	switch ( action.type ) {
		case JETPACK_CONNECT_RETRY_AUTH:
			const slug = action.slug;
			let currentTimestamp = state[ slug ] ? state[ slug ].timestamp || Date.now() : Date.now();
			let attemptNumber = action.attemptNumber;
			if ( attemptNumber > 0 ) {
				const now = Date.now();
				if ( isStale( currentTimestamp, AUTH_ATTEMPS_TTL ) ) {
					currentTimestamp = now;
					attemptNumber = 0;
				}
			}
			return Object.assign( {}, state, {
				[ slug ]: { attempt: attemptNumber, timestamp: currentTimestamp },
			} );
		case JETPACK_CONNECT_COMPLETE_FLOW:
			return {};
	}
	return state;
}
jetpackAuthAttempts.schema = jetpackAuthAttemptsSchema;
