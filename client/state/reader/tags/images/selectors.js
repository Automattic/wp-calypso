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
