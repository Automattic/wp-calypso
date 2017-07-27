/**
 * External dependencies
 */
import { unionBy } from 'lodash';

/**
 * Internal dependencies
 */
import { COMMENTS_TREE_SITE_ADD } from 'state/action-types';
import { keyedReducer } from 'state/utils';

const siteTree = ( state = {}, { tree, type } ) => {
	switch ( type ) {
		case COMMENTS_TREE_SITE_ADD:
			return unionBy( tree, state, 'commentId' );
	}
	return state;
};

const trees = keyedReducer( 'siteId', siteTree );

export default trees;
