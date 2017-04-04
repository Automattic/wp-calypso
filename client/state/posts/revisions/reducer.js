/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { keyBy, map } from 'lodash';

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

function requesting( state = {}, action ) {
	switch ( action.type ) {
		case POST_REVISIONS_REQUEST:
		case POST_REVISIONS_REQUEST_FAILURE:
		case POST_REVISIONS_REQUEST_SUCCESS:
			return {
				...state,
				[ action.siteId ]: {
					...state[ action.siteId ],
					[ action.postId ]: action.type === POST_REVISIONS_REQUEST,
				},
			};

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
				[ postId ]: keyBy( map( action.revisions, normalizeRevisionForState ), 'id' )
			}
		};
	}

	return state;
}

export default combineReducers( {
	requesting,
	revisions,
} );

function normalizeRevisionForState( revision ) {
	if ( ! revision ) {
		return revision;
	}

	return {
		...revision,
		title: revision.title.rendered,
		content: revision.content.rendered,
		excerpt: revision.excerpt.rendered,
	};
}
