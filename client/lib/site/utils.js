
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
	}
};
