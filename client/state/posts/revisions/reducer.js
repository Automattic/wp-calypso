/**
 * External dependencies
 */
import { keyBy } from 'lodash';

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
				[ postId ]: keyBy( action.revisions, 'id' )
			}
		};
	}

	return state;
}
