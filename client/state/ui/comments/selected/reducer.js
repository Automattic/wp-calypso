/** @format */
/**
 * External dependencies
 */
import { has, keyBy, map, omit, partialRight } from 'lodash';

/**
 * Internal dependencies
 */
import {
	COMMENTS_CLEAR_SELECTED,
	COMMENTS_SELECT_ALL,
	COMMENTS_TOGGLE_SELECTED,
} from 'state/action-types';
import { keyedReducer } from 'state/utils';

const mapComments = partialRight( map, ( { commentId, postId } ) => ( { commentId, postId } ) );

const selectedComments = ( state = {}, action ) => {
	switch ( action.type ) {
		case COMMENTS_CLEAR_SELECTED:
			return {};
		case COMMENTS_TOGGLE_SELECTED:
			const { postId, commentId } = action;
			return has( state, commentId )
				? omit( state, commentId )
				: {
						...state,
						[ commentId ]: { commentId, postId },
					};
		case COMMENTS_SELECT_ALL:
			const { comments } = action;
			return keyBy( mapComments( comments ), 'commentId' );
	}

	return state;
};

export default keyedReducer( 'siteId', selectedComments );
