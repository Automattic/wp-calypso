/**
 * Internal dependencies
 */
import getMediaItem from 'calypso/state/selectors/get-media-item';

/**
 * Returns a media item from the redux store
 *
 * @param {number} siteId site identifier
 * @param {number} mediaId media item identifier
 */
export default function ( siteId, mediaId ) {
	/* @TODO: this function was introduced as a workaround to be able to
	 * access a media item from the redux store programatically in
	 * components/tinymce/plugins/wplink/dialog.jsx:165 – ideally it
	 * shouldn't be used anywhere else where we can get data from the
	 * redux store via connect() method */

	return ( dispatch, getState ) => getMediaItem( getState(), siteId, mediaId );
}
