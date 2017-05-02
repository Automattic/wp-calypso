/**
 * External dependencies
 */
import { keyBy, merge } from 'lodash';

/**
 * Internal dependencies
 */
import {
	POST_REVISIONS_RECEIVE,
	POST_REVISIONS_REQUEST,
	POST_REVISIONS_REQUEST_FAILURE,
	POST_REVISIONS_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import { combineReducersWithPersistence } from 'state/utils';

export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case POST_REVISIONS_REQUEST:
		case POST_REVISIONS_REQUEST_FAILURE:
		case POST_REVISIONS_REQUEST_SUCCESS:
			return merge( {}, state, {
				[ action.siteId ]: {
					[ action.postId ]: action.type === POST_REVISIONS_REQUEST,
				},
			} );

		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}

	return state;
}

export function revisions( state = {}, action ) {
	if ( action.type === POST_REVISIONS_RECEIVE ) {
		const { siteId, postId } = action;
		return {
			...state,
			[ siteId ]: {
				...state[ siteId ],
				[ postId ]: keyBy( action.revisions, 'id' )
			}
		};
	}

	return state;
}

export default combineReducersWithPersistence( {
	requesting,
	revisions,
} );
