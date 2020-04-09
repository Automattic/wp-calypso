/**
 * Internal dependencies
 */
import { withoutPersistence } from 'state/utils';
import { SUPPORT_ARTICLE_DIALOG_OPEN, SUPPORT_ARTICLE_DIALOG_CLOSE } from 'state/action-types';

export default withoutPersistence(
	(
		state = {
			postId: null,
			postUrl: null,
			isVisible: false,
		},
		action
	) => {
		switch ( action.type ) {
			case SUPPORT_ARTICLE_DIALOG_OPEN: {
				const { postId, postUrl = null, actionLabel = null, actionUrl = null } = action;

				return {
					postUrl,
					postId,
					isVisible: true,
					actionLabel,
					actionUrl,
				};
			}
			case SUPPORT_ARTICLE_DIALOG_CLOSE:
				return {
					...state,
					isVisible: false,
				};
		}

		return state;
	}
);
