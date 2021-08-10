/**
 * Internal dependencies
 */
import getSiteOption from './get-site-option';

/**
 * Returns true if site has the Jetpack Backup Plugin active, false if it is not active
 *
 * @param  {object}   state  Global state tree
 * @param  {?number}   siteId Site ID
 * @returns {?boolean}        Whether site has the Jetpack Backup plugin active
 */
export default function isBackupPluginActive( state, siteId ) {
	const activeJetpackPlugins = getSiteOption( state, siteId, 'jetpack_connection_active_plugins' );
	if ( activeJetpackPlugins && activeJetpackPlugins.includes( 'jetpack-backup' ) ) {
		return true;
	}

	return false;
}
