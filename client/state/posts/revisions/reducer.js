/**
 * External dependencies
 */
import { keyBy, map } from 'lodash';

/**
 * Internal dependencies
 */
import {
	POST_REVISIONS_RECEIVE,
} from 'state/action-types';

export default function revisions( state = {}, action ) {
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
