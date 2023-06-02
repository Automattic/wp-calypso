/**
 * Returns true if the settings for the site initialized and false otherwise
 *
 * @param  {Object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @returns {boolean}        Whether settings for specific site are initialized
 */
export default function isSiteSettingsInitialized( state, siteId ) {
	return !! state?.siteSettings?.items?.[ siteId ];
}
