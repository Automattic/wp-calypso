/** @format */

/**
 * External dependencies
 */

import i18n from 'i18n-calypso';
import { get } from 'lodash';
import { withoutHttp } from 'client/lib/url';

export default {
	userCan( capability, site ) {
		return site && site.capabilities && site.capabilities[ capability ];
	},

	/**
	 * site's timezone getter
	 *
	 * @param {Object} site - site object
	 * @return {String} timezone
	 */
	timezone( site ) {
		return site && site.options ? site.options.timezone : null;
	},

	/**
	 * site's gmt_offset getter
	 *
	 * @param {Object} site - site object
	 * @return {String} gmt_offset
	 */
	gmtOffset( site ) {
		return site && site.options ? site.options.gmt_offset : null;
	},

	getSiteFileModDisableReason( site, action = 'modifyFiles' ) {
		if ( ! site || ! site.options || ! site.options.file_mod_disabled ) {
			return;
		}

		return site.options.file_mod_disabled
			.map( clue => {
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
					return i18n.translate(
						'Any autoupdates are explicitly disabled by a site administrator.'
					);
				}

				if ( action === 'autoupdateCore' && clue === 'wp_auto_update_core_disabled' ) {
					return i18n.translate(
						'Core autoupdates are explicitly disabled by a site administrator.'
					);
				}
				return null;
			} )
			.filter( reason => reason );
	},

	canUpdateFiles( site ) {
		if ( ! site ) {
			return false;
		}
		if ( ! site.hasMinimumJetpackVersion ) {
			return false;
		}

		if ( ! this.isMainNetworkSite( site ) ) {
			return false;
		}

		const options = site.options;

		if ( options.is_multi_network ) {
			return false;
		}

		if (
			options.file_mod_disabled &&
			( -1 < options.file_mod_disabled.indexOf( 'disallow_file_mods' ) ||
				-1 < options.file_mod_disabled.indexOf( 'has_no_file_system_write_access' ) )
		) {
			return false;
		}

		return true;
	},

	canAutoupdateFiles( site ) {
		if ( ! this.canUpdateFiles( site ) ) {
			return false;
		}

		if (
			site.options.file_mod_disabled &&
			-1 < site.options.file_mod_disabled.indexOf( 'automatic_updater_disabled' )
		) {
			return false;
		}
		return true;
	},

	isMainNetworkSite( site ) {
		if ( ! site ) {
			return false;
		}

		if ( site.options && site.options.is_multi_network ) {
			return false;
		}

		if ( site.is_multisite === false ) {
			return true;
		}

		if ( site.is_multisite ) {
			const unmappedUrl = get( site.options, 'unmapped_url', null );
			const mainNetworkSite = get( site.options, 'main_network_site', null );
			if ( ! unmappedUrl || ! mainNetworkSite ) {
				return false;
			}
			// Compare unmapped_url with the main_network_site to see if is the main network site.
			return ! ( withoutHttp( unmappedUrl ) !== withoutHttp( mainNetworkSite ) );
		}

		return false;
	},

	/**
	 * Checks whether a site has a custom mapped URL.
	 * @param  {Object}   site Site object
	 * @return {?Boolean}      Whether site has custom domain
	 */
	hasCustomDomain( site ) {
		if ( ! site || ! site.domain || ! site.wpcom_url ) {
			return null;
		}

		return site.domain !== site.wpcom_url;
	},

	isModuleActive( site, moduleId ) {
		return site.options.active_modules && site.options.active_modules.indexOf( moduleId ) > -1;
	},
};
