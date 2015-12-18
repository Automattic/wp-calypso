/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';

export default {
	userCan( capability, site ) {
		return site && site.capabilities && site.capabilities[ capability ];
	},

	isPermalinkEditable( site ) {
		if ( ! site || ! site.options || ! site.options.permalink_structure ) {
			return false;
		}

		return /\/\%postname\%\/?/.test( site.options.permalink_structure );
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

	getDefaultCategory( site ) {
		if ( ! site ) {
			return;
		}

		if ( site.settings ) {
			return site.settings.default_category;
		}

		if ( site.options ) {
			return site.options.default_category;
		}
	},

	getDefaultPostFormat( site ) {
		if ( ! site ) {
			return;
		}

		if ( site.settings ) {
			return site.settings.default_post_format;
		}

		if ( site.options ) {
			return site.options.default_post_format;
		}
	},

	getSiteFileModDisableReason( site, action = 'modifyFiles' ) {
		if ( ! site || ! site.options || ! site.options.file_mod_disabled ) {
			return;
		}
		let reasons = [];
		for ( let clue of site.options.file_mod_disabled ) {
			if ( action === 'modifyFiles'
				|| action === 'autoupdateFiles'
				|| action === 'autoupdateCore' ) {
				switch ( clue ) {
					case 'has_no_file_system_write_access':
						reasons.push(
							i18n.translate( 'The file permissions on this host prevent editing files.' )
						);
						break;
					case 'disallow_file_mods':
						reasons.push(
							i18n.translate( 'File modifications are explicitly disabled by a site administrator.' )
						);
						break;
				}
			}

			if ( action === 'autoupdateFiles'
				|| action === 'autoupdateCore' ) {
				switch ( clue ) {
					case 'automatic_updater_disabled':
						reasons.push(
							i18n.translate( 'Any autoupdates are explicitly disabled by a site administrator.' )
						);
						break;
				}
			}

			if ( action === 'autoupdateCore' ) {
				switch ( clue ) {
					case 'wp_auto_update_core_disabled':
						reasons.push(
							i18n.translate( 'Core autoupdates are explicitly disabled by a site administrator.' )
						);
						break;
				}
			}
		}
		return reasons;
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

		if ( options.file_mod_disabled
			&& ( -1 < options.file_mod_disabled.indexOf( 'disallow_file_mods' )
				|| -1 < options.file_mod_disabled.indexOf( 'has_no_file_system_write_access' ) )
		) {
			return false;
		}

		return true;
	},

	canAutoupdateFiles( site ) {
		if ( ! this.canUpdateFiles( site ) ) {
			return false;
		}

		if ( site.options.file_mod_disabled
			&& -1 < site.options.file_mod_disabled.indexOf( 'automatic_updater_disabled' ) ) {
			return false;
		}
		return true;
	},

	canAutoupdateCore( site ) {
		if ( ! this.canAutoupdateFiles( site ) ) {
			return false;
		}

		if ( site.options.file_mod_disabled
			&& -1 < site.options.file_mod_disabled.indexOf( 'automatic_updater_disabled' ) ) {
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
			// Compare unmapped_url with the main_network_site to see if is the main network site.
			return ! ( site.options &&
				site.options.unmapped_url.replace( /^https?:\/\//, '' ) !== site.options.main_network_site.replace( /^https?:\/\//, '' )
			);
		}

		return false;
	}
};
