import { get } from 'lodash';

import 'calypso/state/editor/init';

/**
 * Returns the original aspect ratio of the image loaded in the image editor.
 * This is based on the original image's width/height when it was loaded.
 *
 * @param  {Object}  state   Global state tree
 * @returns {?Object}         Original image dimensions, if known
 */
export default function getImageEditorOriginalAspectRatio( state ) {
	return get( state, 'editor.imageEditor.originalAspectRatio', null );
}
