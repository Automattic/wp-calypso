import { withStorageKey } from '@automattic/state-utils';
import {
	SUPPORT_ARTICLE_DIALOG_OPEN,
	SUPPORT_ARTICLE_DIALOG_CLOSE,
} from 'calypso/state/action-types';

export default withStorageKey(
	'inlineSupportArticle',
	(
		state = {
			postId: null,
			postUrl: null,
			blogId: null,
		},
		action
	) => {
		switch ( action.type ) {
			case SUPPORT_ARTICLE_DIALOG_OPEN: {
				const {
					postId,
					postUrl = null,
					actionLabel = null,
					actionUrl = null,
					blogId = null,
				} = action;

				return {
					postUrl,
					postId,
					actionLabel,
					actionUrl,
					blogId,
				};
			}
			case SUPPORT_ARTICLE_DIALOG_CLOSE:
				return {
					...state,
				};
		}

		return state;
	}
);
