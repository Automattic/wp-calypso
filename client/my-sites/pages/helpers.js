module.exports = {
	editLinkForPage: function( page, site ) {
		if ( ! ( page && page.ID ) || ! ( site && site.ID ) ) {
			return null;
		}

		return '/page/' + site.slug + '/' + page.ID;
	},

	statsLinkForPage: function( page, site ) {
		if ( ! ( page && page.ID ) || ! ( site && site.ID ) ) {
			return null;
		}

		return '/stats/post/' + page.ID + '/' + site.slug;
	},

	// TODO: switch all usage of this function to `isFrontPage` in `state/pages/selectors`
	isFrontPage: function( page, site ) {
		if ( ! page || ! page.ID || ! site || ! site.options ) {
			return false;
		}
		return site.options.page_on_front === page.ID;
	}
};
