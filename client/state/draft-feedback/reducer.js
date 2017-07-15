/**
 * Internal dependencies
 */
import {
	DRAFT_FEEDBACK_SHARE_ADD,
	DRAFT_FEEDBACK_SHARE_REMOVE,
	DRAFT_FEEDBACK_SHARE_REVOKE,
	DRAFT_FEEDBACK_SHARE_RESTORE,
	DRAFT_FEEDBACK_COMMENT_ADD,
} from 'state/action-types';
import { keyedReducer, withoutPersistence } from 'state/utils';

const initialState = {};

// TODO: Only apply this reducer to 'post' and 'page' types
// TODO: Should state be forgotten when we stop editing a post?
export default withoutPersistence(
	keyedReducer(
		'siteId',
		keyedReducer(
			'postId',
			keyedReducer( 'emailAddress', ( state = initialState, action ) => {
				switch ( action.type ) {
					case DRAFT_FEEDBACK_SHARE_ADD:
						return {
							enabled: true,
							comments: []
						};

					case DRAFT_FEEDBACK_SHARE_REMOVE:
						return initialState;

					case DRAFT_FEEDBACK_SHARE_REVOKE:
						return {
							...state,
							enabled: false,
						};

					case DRAFT_FEEDBACK_SHARE_RESTORE:
						return {
							...state,
							enabled: true,
						};

					case DRAFT_FEEDBACK_COMMENT_ADD:
						return {
							...state,
							comments: state.comments.concat( action.comment ),
						};

					default:
						return state;
				}
			} ),
		),
	),
);
