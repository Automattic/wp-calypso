/**
 * Retrieve the data of a certain shortcode for a particular site
 * @param  {Object} state      Global state tree
 * @param  {Number} siteId     Site ID
 * @param  {String} shortcode  Shortcode
 * @return {Object}            Shortcode data
 */
export const getShortcode = ( state, siteId, shortcode ) => {
	if ( ! state.shortcodes[ siteId ] || ! state.shortcodes[ siteId ][ shortcode ] ) {
		return;
	}

	return state.shortcodes[ siteId ][ shortcode ];
};
