import { withStorageKey } from '@automattic/state-utils';
import {
	SUPPORT_ARTICLE_DIALOG_OPEN,
	SUPPORT_ARTICLE_DIALOG_CLOSE,
} from 'calypso/state/action-types';

function defaultPostId() {
	if ( ! window || ! URLSearchParams ) {
		return null;
	}

	const searchParams = new URLSearchParams( window.location.search );
	return searchParams.has( 'support-article' )
		? parseInt( searchParams.get( 'support-article' ) )
		: null;
}

function defaultPostUrl() {
	const postId = defaultPostId();
	if ( postId ) {
		return 'https://support.wordpress.com?p=' + postId;
	}
	return null;
}

export default withStorageKey(
	'inlineSupportArticle',
	(
		state = {
			postId: defaultPostId(),
			postUrl: defaultPostUrl(),
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
