/**
 * Internal dependencies
 */
import {
	EDITOR_START,
	EDITOR_STOP,
	DRAFT_FEEDBACK_SHARE_ADD,
	DRAFT_FEEDBACK_SHARE_REMOVE,
	DRAFT_FEEDBACK_SHARE_REVOKE,
	DRAFT_FEEDBACK_SHARE_RESTORE,
	DRAFT_FEEDBACK_COMMENT_ADD,
} from 'state/action-types';
import { keyedReducer, withoutPersistence } from 'state/utils';

const initialState = {};
const initialDraftShareState = {
	enabled: true,
	comments: [],
};

const draftShareReducer = keyedReducer(
	'emailAddress',
	( state = initialDraftShareState, action ) => {
		switch ( action.type ) {
			case DRAFT_FEEDBACK_SHARE_ADD:
				return initialDraftShareState;

			case DRAFT_FEEDBACK_SHARE_REMOVE:
				return undefined;

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
	},
);

export default withoutPersistence(
	keyedReducer(
		'siteId',
		keyedReducer( 'postId', ( state, action ) => {
			switch ( action.type ) {
				case EDITOR_START:
					return {};

				case EDITOR_STOP:
					return undefined;

				default:
					return draftShareReducer( state, action );
			}
		} ),
	),
);
