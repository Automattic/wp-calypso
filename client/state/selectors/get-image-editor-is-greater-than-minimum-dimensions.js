/**
 * External dependencies
 */
import { isInteger } from 'lodash';

/**
 * Internal dependencies
 */
import { getImageEditorOriginalAspectRatio } from 'state/selectors';
import { MinimumImageDimensions } from 'state/ui/editor/image-editor/constants';

/**
 * Returns whether the original image size is greater than minimumImageDimensions values.
 *
 * @param  {Object}  state Global state tree
 * @param   {Integer} minimumWidth the minimum width of the image
 * @param   {Integer} minimumHeight the minimum height of the image
 * @returns {Boolean} whether dimensions of the image meet the minimum dimension requirements
 */
export default function getImageEditorIsGreaterThanMinimumDimensions(
	state,
	minimumWidth = MinimumImageDimensions.WIDTH,
	minimumHeight = MinimumImageDimensions.HEIGHT ) {
	const originalAspectRatio = getImageEditorOriginalAspectRatio( state );

	if ( originalAspectRatio ) {
		const { width, height } = originalAspectRatio;

		if ( isInteger( width ) &&
			isInteger( height ) &&
			width > minimumWidth &&
			height > minimumHeight ) {
			return true;
		}
	}
	return false;
}
