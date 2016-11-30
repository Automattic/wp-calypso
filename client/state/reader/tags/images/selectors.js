/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the all images available for a given tag.
 *
 * @param  {Object}  state  Global state tree
 * @param  {String}  tag 	Tag
 * @return {Object} Image
 */
export function getTagImages( state, tag ) {
	const items = get( state, 'reader.tags.images.items' );

	if ( ! items || ! items[ tag ] ) {
		return undefined;
	}

	return state.reader.tags.images.items[ tag ];
}

/**
 * Returns true if a request is in progress to retrieve the tag images
 * for a given tag.
 *
 * @param  {Object}  state  Global state tree
 * @param  {String}  tag 	Tag
 * @return {Boolean} Whether a request is in progress
 */
export function isRequestingTagImages( state, tag ) {
	return !! state.reader.tags.images.requesting[ tag ];
}

