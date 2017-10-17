/** @format */
/**
 * External dependencies
 */
import { filter } from 'lodash';

/**
 * Internal dependencies
 */
import { COMMENTS_SELECT, COMMENTS_DESELECT } from 'state/action-types';
import { keyedReducer } from 'state/utils';

const selectedComments = ( state = [], { type, commentId } ) => {
	switch ( type ) {
		case COMMENTS_SELECT:
			return [ ...state, commentId ];
		case COMMENTS_DESELECT:
			return filter( state, commentId );
	}
	return state;
};

export default keyedReducer( 'siteId', selectedComments );
