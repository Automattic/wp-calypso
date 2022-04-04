import getSiteOption from './get-site-option';

/**
 * Returns true if site has the Jetpack Search Plugin active, false if it is not active
 *
 * @param  {object}   state  Global state tree
 * @param  {?number}   siteId Site ID
 * @returns {?boolean}        Whether site has the Jetpack Search plugin active
 */
export default function isSearchPluginActive( state, siteId ) {
	const activeJetpackPlugins = getSiteOption( state, siteId, 'jetpack_connection_active_plugins' );
	if ( activeJetpackPlugins && activeJetpackPlugins.includes( 'jetpack-search' ) ) {
		return true;
	}

	return false;
}
