/**
 * External dependencies
 */
import { isInteger } from 'lodash';

/**
 * Internal dependencies
 */
import { MinimumImageDimensions } from 'calypso/state/editor/image-editor/constants';
import getImageEditorOriginalAspectRatio from 'calypso/state/selectors/get-image-editor-original-aspect-ratio';

/**
 * Returns whether the original image size is greater than minimumImageDimensions values.
 *
 * @param  {object}  state Global state tree
 * @param   {Integer} minimumWidth the minimum width of the image
 * @param   {Integer} minimumHeight the minimum height of the image
 * @returns {boolean} whether dimensions of the image meet the minimum dimension requirements
 */
export default function getImageEditorIsGreaterThanMinimumDimensions(
	state,
	minimumWidth = MinimumImageDimensions.WIDTH,
	minimumHeight = MinimumImageDimensions.HEIGHT
) {
	const originalAspectRatio = getImageEditorOriginalAspectRatio( state );

	if ( originalAspectRatio ) {
		const { width, height } = originalAspectRatio;

		if (
			isInteger( width ) &&
			isInteger( height ) &&
			width > minimumWidth &&
			height > minimumHeight
		) {
			return true;
		}
	}
	return false;
}
