import 'calypso/state/reader/init';

/**
 * Returns the url for a thumbnail for a given iframe.
 *
 * @param  {Object}  state  Global state tree
 * @param  {string}  iframeSrc iframeSrc
 * @returns {string}  url you can find the thumbnail at
 */
export function getThumbnailForIframe( state, iframeSrc ) {
	return state.reader.thumbnails.items[ iframeSrc ];
}
