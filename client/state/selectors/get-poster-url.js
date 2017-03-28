/**
 * Returns the poster URL of the video.
 *
 * @param  {Object}  state Global state tree
 * @return {String}  URL of the poster.
 */
export default function getPosterUrl( state ) {
	return state.ui.editor.videoEditor.url;
}
