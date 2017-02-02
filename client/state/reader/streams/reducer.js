/**
 * External Dependencies
 */
import { map } from 'lodash';

/**
 * Internal Dependencies
 */
import { READER_STREAMS_PAGE_RECEIVE } from 'state/action-types';



export default function streamReducer( state = {}, action ) {
	if ( action.type !== READER_STREAMS_PAGE_RECEIVE ) {
		return state;
	}
	const { payload, streamId } = action;
	let stream = state[ streamId ] || [];
	stream = stream.concat( map( payload.posts, 'global_ID' ) );

	return {
		...state,
		[ streamId ]: stream
	};
}
