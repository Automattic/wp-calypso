import isJetpackConnectionPluginActive from './is-jetpack-connection-plugin-active';

/**
 * Returns true if site has the Jetpack Backup Plugin active, false if it is not active
 *
 * @param  {Object}   state  Global state tree
 * @param  {?number}   siteId Site ID
 * @returns {?boolean}        Whether site has the Jetpack Backup plugin active
 */
export default function isBackupPluginActive( state, siteId ) {
	return isJetpackConnectionPluginActive( state, siteId, 'jetpack-backup' );
}
