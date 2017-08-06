/**
 * Internal dependencies
 */
import {
	POST_SHARE_A_DRAFT_ADD,
	POST_SHARE_A_DRAFT_ENABLE,
	POST_SHARE_A_DRAFT_DISABLE,
} from 'state/action-types';
import { combineReducers, keyedReducer } from 'state/utils';

export const isEnabled = ( state = false, action ) => {
	switch ( action.type ) {
		case POST_SHARE_A_DRAFT_ADD:
			return action.isEnabled;
		case POST_SHARE_A_DRAFT_ENABLE:
			return true;
		case POST_SHARE_A_DRAFT_DISABLE:
			return false;
		default:
			return state;
	}
};

export const link = ( state = '', action ) =>
	action.type === POST_SHARE_A_DRAFT_ADD ? action.link : state;

export const draftShare = combineReducers( {
	isEnabled,
	link,
} );

export default keyedReducer( 'siteId', keyedReducer( 'postId', draftShare ) );
