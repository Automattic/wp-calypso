/**
 * External dependencies
 */
import { reject, unionBy } from 'lodash';

/**
 * Internal dependencies
 */
import {
	COMMENTS_DELETE,
	COMMENTS_TREE_SITE_ADD,
} from 'state/action-types';
import { keyedReducer } from 'state/utils';

const siteTree = ( state = [], action ) => {
	switch ( action.type ) {
		case COMMENTS_DELETE:
			const { commentId } = action;
			return reject( state, { commentId } );
		case COMMENTS_TREE_SITE_ADD:
			return unionBy( action.tree, state, 'commentId' );
	}
	return state;
};

const trees = keyedReducer( 'siteId', siteTree );

export default trees;
