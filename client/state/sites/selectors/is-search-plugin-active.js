import isJetpackConnectionPluginActive from './is-jetpack-connection-plugin-active';

/**
 * Returns true if site has the Jetpack Search Plugin active, false if it is not active
 *
 * @param  {Object}   state  Global state tree
 * @param  {?number}   siteId Site ID
 * @returns {?boolean}        Whether site has the Jetpack Search plugin active
 */
export default function isSearchPluginActive( state, siteId ) {
	return isJetpackConnectionPluginActive( state, siteId, 'jetpack-search' );
}
