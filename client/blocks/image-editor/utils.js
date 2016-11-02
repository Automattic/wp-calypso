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
import { AspectRatiosValues } from 'state/ui/editor/image-editor/constants';

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
