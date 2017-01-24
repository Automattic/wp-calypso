/**
 * External Dependencies
 */

/**
 * Internal Dependencies
 */
import { READER_STREAMS_PAGE_RECEIVE } from 'state/action-types';

export default function streamReducer( state = {}, action ) {
	if ( action.type !== READER_STREAMS_PAGE_RECEIVE ) {
		return state;
	}
	return state;
}
