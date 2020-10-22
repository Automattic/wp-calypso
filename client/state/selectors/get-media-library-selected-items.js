/**
 * Internal dependencies
 */
import getMediaItem from 'calypso/state/selectors/get-media-item';

/**
 * Retrieves the currently selected media library items for a specified site.
 *
 * @param {object}   state  Global state tree
 * @param {number}   siteId ID of the site
 * @returns {Array}         Selected media items for that site.
 */
export default ( state, siteId ) => {
	if ( ! siteId ) {
		return [];
	}

	const selectedMediaIds = state.media.selectedItems[ siteId ];

	if ( ! selectedMediaIds ) {
		return [];
	}

	return selectedMediaIds
		.map( ( mediaId ) => getMediaItem( state, siteId, mediaId ) )
		.filter( ( media ) => media );
};
