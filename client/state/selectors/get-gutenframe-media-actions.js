/**
 * Retrieve media actions meant to be passed on to the Gutenberg IFrame / Gutenframe.
 *
 * @param {number}  mediaId Media ID
 * @returns {Array}         Media objects, if any
 */

export default function getGutenframeMediaActions( state, siteId ) {
	return state.media._gutenframeMediaActions[ siteId ] ?? [];
}
