import getMediaItem from 'calypso/state/selectors/get-media-item';

import 'calypso/state/media/init';

const EMPTY_ARRAY = [];

/**
 * Retrieves the currently selected media library items for a specified site.
 *
 * @param {Object}   state  Global state tree
 * @param {number}   siteId ID of the site
 * @returns {Array}         Selected media items for that site.
 */
export default ( state, siteId ) => {
	if ( ! siteId ) {
		return EMPTY_ARRAY;
	}

	const selectedMediaIds = state.media.selectedItems[ siteId ];

	if ( ! selectedMediaIds ) {
		return EMPTY_ARRAY;
	}

	return selectedMediaIds
		.map( ( mediaId ) => getMediaItem( state, siteId, mediaId ) )
		.filter( ( media ) => media );
};
