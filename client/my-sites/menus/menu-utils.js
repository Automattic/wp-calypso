/**
 * Internal dependencies
 */
var sites = require( 'lib/sites-list' )(),
	decodeEntities = require( 'lib/formatting' ).decodeEntities,
	i18n = require( 'lib/mixins/i18n' );

module.exports = {

	getNavMenusUrl: function() {
		var site = sites.getSelectedSite();
		return site.options.admin_url + 'nav-menus.php';
	},

	getContentTitle: function( content ) {
		return content.title ||
			( content.name && decodeEntities( content.name ) ) ||
			i18n.translate( 'Untitled' );
	}

};
