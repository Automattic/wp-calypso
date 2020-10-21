/**
 * External dependencies
 *
 */
import { includes, get } from 'lodash';

/**
 * Internal dependencies
 */
import { AspectRatios, AspectRatiosValues } from 'calypso/state/editor/image-editor/constants';

/**
 * Returns the default aspect ratio image editor should use.
 *
 * If only aspectRatio is specified and is valid, we return it. If only aspectRatios is specified and is valid,
 * we return its first item. If both aspectRatio and aspectRatios are specified, we return either:
 * 1. aspectRatio, if it is included in aspectRatios
 * 2. aspectRatios[ 0 ] if aspectRatio is not included in aspectRatios
 *
 * We return AspectRatios.FREE if no specified aspect ratio is valid.
 *
 * @param   {string} aspectRatio  an aspect ratio which should be validated and used as default one for image editor
 * @param   {Array}  aspectRatios list of aspect ratios to be validated and used in image editor
 * @returns {string}              the default valid aspect ratio image editor should use
 */
export function getDefaultAspectRatio( aspectRatio = null, aspectRatios = AspectRatiosValues ) {
	if ( ! includes( aspectRatios, aspectRatio ) ) {
		aspectRatio = get( aspectRatios, '0', AspectRatios.FREE );
	}

	return includes( AspectRatiosValues, aspectRatio )
		? aspectRatio
		: getDefaultAspectRatio( aspectRatio );
}
