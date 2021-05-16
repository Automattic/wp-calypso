import 'calypso/state/media/init';

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

	return state.media.selectedItems?.[ siteId ] ?? [];
};
