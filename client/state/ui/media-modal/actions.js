/**
 * Internal dependencies
 */
import { MEDIA_MODAL_VIEW_SET } from 'state/action-types';

/**
 * Returns an action object used in signalling that the media modal current
 * view should be updated.
 *
 * @see ./constants.js (ModalViews)
 *
 * @param  {ModalViews} view Media view
 * @return {Object}          Action object
 */
export function setMediaModalView( view ) {
	return {
		type: MEDIA_MODAL_VIEW_SET,
		view
	};
}

/**
 * Returns an action object used in signalling that the media modal current
 * view should be reset to its initial value.
 *
 * @see ./constants.js (ModalViews)
 *
 * @param  {ModalViews} view Media view
 * @return {Object}          Action object
 */
export function resetMediaModalView() {
	return setMediaModalView( null );
}
