/**
 * Internal dependencies
 */
import { MEDIA_MODAL_VIEW_SET } from 'calypso/state/action-types';

import 'calypso/state/ui/init';

/**
 * Returns an action object used in signalling that the media modal current
 * view should be updated.
 *
 * @see ./constants.js (ModalViews)
 *
 * @param  {any} view Media view
 * @returns {object}          Action object
 */
export function setMediaModalView( view ) {
	return {
		type: MEDIA_MODAL_VIEW_SET,
		view,
	};
}

/**
 * Returns an action object used in signalling that the media modal current
 * view should be reset to its initial value.
 *
 * @see ./constants.js (ModalViews)
 *
 * @returns {object}          Action object
 */
export function resetMediaModalView() {
	return setMediaModalView( null );
}
