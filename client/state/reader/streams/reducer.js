/**
 * External Dependencies
 */
import { map } from 'lodash';

/**
 * Internal Dependencies
 */
import { READER_STREAMS_PAGE_RECEIVE } from 'state/action-types';

export function singleStreamReducer( state = [], posts ) {
	//TODO should we dedupe the posts that came in here?
	return state.concat( map( posts, 'global_ID' ) );
}

export default function streamReducer( state = {}, action ) {
	if ( action.type !== READER_STREAMS_PAGE_RECEIVE ) {
		return state;
	}
	const { payload: { posts }, streamId } = action;

	if ( ! posts ) {
		return state;
	}

	const originalStream = state[ streamId ];
	const newStream = singleStreamReducer( originalStream, posts );

	if ( newStream === originalStream ) {
		return state;
	}

	return {
		...state,
		[ streamId ]: newStream
	};
}
