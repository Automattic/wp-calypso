/**
 * Internal dependencies
 */
var config = require( 'config' );

module.exports = {
	editLinkForPage: function( page, site ) {
		if ( ! ( page && page.ID ) || ! ( site && site.ID ) ) {
			return null;
		}

		if ( config.isEnabled( 'post-editor/pages' ) ) {
			return '/page/' + site.slug + '/' + page.ID;
		}

		return 'https://wordpress.com/page/' + site.ID + '/' + page.ID;
	},

	isFrontPage: function( page, site ) {
		if ( ! page || ! page.ID || ! site || ! site.options ) {
			return false;
		}
		return site.options.page_on_front === page.ID;
	}
};
