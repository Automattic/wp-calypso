/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import { compact } from 'lodash';

/**
 * Internal dependencies
 */
import getSiteOption from './get-site-option';
import isJetpackSite from './is-jetpack-site';

/**
 * Returns an explanation on why updates are disabled on a Jetpack Site.
 * Returns null if the site is not known or is not a Jetpack site.
 * Can return an empty array if no reason have been found
 *
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @param {string} action The update action we wanted to perform on this site
 * @returns {?Array<string>} The reasons why file update is disabled
 */
export default function getJetpackSiteUpdateFilesDisabledReasons(
	state,
	siteId,
	action = 'modifyFiles'
) {
	if ( ! isJetpackSite( state, siteId ) ) {
		return null;
	}

	const fileModDisabled = getSiteOption( state, siteId, 'file_mod_disabled' );

	return compact(
		fileModDisabled.map( ( clue ) => {
			if (
				action === 'modifyFiles' ||
				action === 'autoupdateFiles' ||
				action === 'autoupdateCore'
			) {
				if ( clue === 'has_no_file_system_write_access' ) {
					return i18n.translate( 'The file permissions on this host prevent editing files.' );
				}
				if ( clue === 'disallow_file_mods' ) {
					return i18n.translate(
						'File modifications are explicitly disabled by a site administrator.'
					);
				}
			}

			if (
				( action === 'autoupdateFiles' || action === 'autoupdateCore' ) &&
				clue === 'automatic_updater_disabled'
			) {
				return i18n.translate( 'Any autoupdates are explicitly disabled by a site administrator.' );
			}

			if ( action === 'autoupdateCore' && clue === 'wp_auto_update_core_disabled' ) {
				return i18n.translate(
					'Core autoupdates are explicitly disabled by a site administrator.'
				);
			}
			return null;
		} )
	);
}
