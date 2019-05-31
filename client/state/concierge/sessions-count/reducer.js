/** @format */

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	CONCIERGE_SESSIONS_COUNT_REQUEST,
	CONCIERGE_SESSIONS_COUNT_UPDATE,
} from 'state/action-types';

export const sessionsCount = createReducer( null, {
	[ CONCIERGE_SESSIONS_COUNT_REQUEST ]: () => null,
	[ CONCIERGE_SESSIONS_COUNT_UPDATE ]: ( state, { count } ) => count,
} );

export default sessionsCount;
