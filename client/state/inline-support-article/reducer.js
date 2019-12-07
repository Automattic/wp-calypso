/** @format */
/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { SUPPORT_ARTICLE_DIALOG_OPEN, SUPPORT_ARTICLE_DIALOG_CLOSE } from 'state/action-types';

export default createReducer(
	{
		postId: null,
		postUrl: null,
		isVisible: false,
	},
	{
		[ SUPPORT_ARTICLE_DIALOG_OPEN ]: ( state, { postId, postUrl = null } ) => ( {
			postUrl,
			postId,
			isVisible: true,
		} ),
		[ SUPPORT_ARTICLE_DIALOG_CLOSE ]: state => ( {
			...state,
			isVisible: false,
		} ),
	}
);
