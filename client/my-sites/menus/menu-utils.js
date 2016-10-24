/**
 * External dependencies
 */
var i18n = require( 'i18n-calypso' );

/**
 * Internal dependencies
 */
var sites = require( 'lib/sites-list' )(),
	decodeEntities = require( 'lib/formatting' ).decodeEntities;

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
