import 'calypso/state/media/init';

const EMPTY_ARRAY = [];

/**
 * Retrieves the currently selected media library items for a specified site.
 *
 * @param {object}   state  Global state tree
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

	return state.media.selectedItems?.[ siteId ] ?? EMPTY_ARRAY;
};
