import { MinimumImageDimensions } from 'calypso/state/editor/image-editor/constants';
import getImageEditorOriginalAspectRatio from 'calypso/state/selectors/get-image-editor-original-aspect-ratio';

/**
 * Returns whether the original image size is greater than minimumImageDimensions values.
 *
 * @param  {Object}  state Global state tree
 * @param   {number} minimumWidth the minimum width of the image
 * @param   {number} minimumHeight the minimum height of the image
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
			Number.isInteger( width ) &&
			Number.isInteger( height ) &&
			width > minimumWidth &&
			height > minimumHeight
		) {
			return true;
		}
	}
	return false;
}
