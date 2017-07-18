/**
 * External dependencies
 */
import {
	indexOf,
	get
} from 'lodash';

/**
 * Internal dependencies
 */
import {
	AspectRatiosValues,
	MinimumImageDimensions
} from 'state/ui/editor/image-editor/constants';

/**
 * Returns the default aspect ratio image editor should use.
 *
 * If only aspectRatio is specified and is valid, we return it. If only aspectRatios is specified and is valid,
 * we return its first item. If both aspectRatio and aspectRatios are specified, we return either:
 * 1. aspectRatio, if it is included in aspectRatios
 * 2. aspectRatios[ 0 ] if aspectRatio is not included in aspectRatios
 *
 * We return AllAspectRatios.FREE if no specified aspect ratio is valid.
 *
 * @param   {String} aspectRatio  an aspect ratio which should be validated and used as default one for image editor
 * @param   {Array}  aspectRatios list of aspect ratios to be validated and used in image editor
 * @returns {String}              the default valid aspect ratio image editor should use
 */
export function getDefaultAspectRatio( aspectRatio = null, aspectRatios = AspectRatiosValues ) {
	if ( indexOf( aspectRatios, aspectRatio ) === -1 ) {
		aspectRatio = get( aspectRatios, '0', AspectRatiosValues.FREE );
	}

	return indexOf( AspectRatiosValues, aspectRatio ) === -1
		? getDefaultAspectRatio( aspectRatio )
		: aspectRatio;
}

/**
 * Checks if the supplied height and width values are greater than defined minimum values.
 *
 * Expected model
 * @typedef {Object} MinimumImageDimensions
 * @property {Integer} WIDTH
 * @property {Integer} HEIGHT
 *
 * @param   {Number} width The width of the image/element
 * @param   {Number} height The height of the image/element
 * @param   {MinimumImageDimensions} minimumDimensions The minimum dimensions to check against
 * @returns {Boolean}
 */
export function meetsMinimumDimensions( width, height, minimumDimensions = MinimumImageDimensions ) {
	if ( typeof width === 'number' && typeof width === 'number' ) {
		return height > minimumDimensions.HEIGHT && width > minimumDimensions.HEIGHT;
	}
	return false;
}

