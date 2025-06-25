import { EDITOR_STOP } from 'calypso/state/action-types';
import { withAnalytics, bumpStat } from 'calypso/state/analytics/actions';
import { setMediaModalView } from 'calypso/state/ui/media-modal/actions';
import { ModalViews } from 'calypso/state/ui/media-modal/constants';

import 'calypso/state/editor/init';
import 'calypso/state/ui/init';

/**
 * Constants
 */
export const MODAL_VIEW_STATS = {
	[ ModalViews.LIST ]: 'view_list',
	[ ModalViews.DETAIL ]: 'view_detail',
	[ ModalViews.GALLERY ]: 'view_gallery',
	[ ModalViews.IMAGE_EDITOR ]: 'view_edit',
	[ ModalViews.VIDEO_EDITOR ]: 'view_edit',
};

/**
 * Returns an action object to be used in signalling that the editor should
 * stop editing.
 * @param  {number}  siteId Site ID
 * @param  {?number} postId Post ID
 * @returns {any}         Action object
 */
export function stopEditingPost( siteId, postId ) {
	return {
		type: EDITOR_STOP,
		siteId,
		postId,
	};
}

/**
 * Returns an action object used in signalling that the media modal current
 * view should be updated in the context of the post editor.
 * @param  {ModalViews} view Media view
 * @returns {Object}          Action object
 */
export function setEditorMediaModalView( view ) {
	const action = setMediaModalView( view );

	const stat = MODAL_VIEW_STATS[ view ];
	if ( stat ) {
		return withAnalytics( bumpStat( 'editor_media_actions', stat ), action );
	}

	return action;
}
