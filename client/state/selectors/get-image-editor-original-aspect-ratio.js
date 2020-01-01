/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns the original aspect ratio of the image loaded in the image editor.
 * This is based on the original image's width/height when it was loaded.
 *
 * @param  {object}  state   Global state tree
 * @return {?object}         Original image dimensions, if known
 */
export default function getImageEditorOriginalAspectRatio( state ) {
	return get( state, 'ui.editor.imageEditor.originalAspectRatio', null );
}
