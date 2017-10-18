/** @format */
/**
 * External dependencies
 */
import { filter } from 'lodash';

/**
 * Internal dependencies
 */
import { COMMENTS_TOGGLE_SELECT } from 'state/action-types';
import { keyedReducer } from 'state/utils';

const selectedComments = ( state = [], { type, commentId } ) => {
	if ( COMMENTS_TOGGLE_SELECT === type ) {
		const isSelected = state.indexOf( commentId ) > -1;

		return isSelected ? filter( state, commentId ) : [ ...state, commentId ];
	}

	return state;
};

export default keyedReducer( 'siteId', selectedComments );
