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

	getSiteFileModDisableReason( site ) {
		if ( ! site || ! site.options || ! site.options.file_mod_disabled ) {
			return;
		}
		let reasons = [];
		for ( let clue of site.options.file_mod_disabled ) {
			switch ( clue ) {
				case 'is_version_controlled':
					reasons.push(
						i18n.translate( 'This site\'s files are under version control.' )
					);
					break;
				case 'has_no_file_system_write_access':
					reasons.push(
						i18n.translate( 'The file permissions on this host prevent editing files.' )
					);
					break;
				case 'automatic_updater_disabled':
					reasons.push(
						i18n.translate( 'Any autoupdates are explicitly disabled by a site administrator.' )
					);
					break;
				case 'wp_auto_update_core_disabled':
					reasons.push(
						i18n.translate( 'Core autoupdates are explicitly disabled by a site administrator.' )
					);
					break
				case 'disallow_file_edit':
					reasons.push(
						i18n.translate( 'File edits are explicitly disabled by a site administrator.' )
					);
					break;
				case 'disallow_file_mods':
					reasons.push(
						i18n.translate( 'File modifications are explicitly disabled by a site administrator.' )
					);
					break;
			}
		}
		return reasons;
	}
};
