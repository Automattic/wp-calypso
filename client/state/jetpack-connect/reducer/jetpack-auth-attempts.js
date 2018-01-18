/** @format */
/**
 * Internal dependencies
 */
import { AUTH_ATTEMPS_TTL } from '../constants';
import { isStale } from '../utils';
import { JETPACK_CONNECT_COMPLETE_FLOW, JETPACK_CONNECT_RETRY_AUTH } from 'state/action-types';
import { jetpackAuthAttemptsSchema } from './schema';
import { keyedReducer } from 'state/utils';

const jetpackAuthAttempts = keyedReducer(
	'slug',
	( state = undefined, { type, attemptNumber } ) => {
		switch ( type ) {
			case JETPACK_CONNECT_RETRY_AUTH:
				const currentTimestamp = state ? state.timestamp : Date.now();
				if ( attemptNumber > 0 && isStale( currentTimestamp, AUTH_ATTEMPS_TTL ) ) {
					return {
						attempt: 0,
						timestamp: Date.now(),
					};
				}
				return {
					attempt: attemptNumber,
					timestamp: currentTimestamp,
				};

			case JETPACK_CONNECT_COMPLETE_FLOW:
				return undefined;
		}
		return state;
	}
);
jetpackAuthAttempts.schema = jetpackAuthAttemptsSchema;

export default jetpackAuthAttempts;
