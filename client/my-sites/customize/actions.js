/**
 * External dependencies
 */
var defer = require( 'lodash/function/defer' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	page = require( 'page' ),
	wpcom = require( 'lib/wp' ),
	CartActions = require( 'lib/upgrades/actions' ),
	activated = require( 'lib/themes/actions' ).activated,
	ThemeHelper = require( 'lib/themes/helpers' ),
	themeItem = require( 'lib/cart-values/cart-items' ).themeItem;

var CustomizeActions = {
	fetchMuseCustomizations: function( site ) {
		wpcom.undocumented().site( site ).getMuseCustomizations( function( error, data ) {
			Dispatcher.handleViewAction( {
				type: 'RECEIVED_MUSE_CUSTOMIZATIONS',
				error,
				data
			} );
		} );
	},

	purchase: function( id, site ) {
		CartActions.addItem( themeItem( id, 'customizer' ) );

		ThemeHelper.trackClick( 'customizer', 'purchase' );

		defer( function() {
			page( '/checkout/' + site.slug );

			Dispatcher.handleViewAction( {
				type: 'PURCHASE_THEME_WITH_CUSTOMIZER',
				id: id,
				site: site
			} );
		} );
	},

	activated: function( id, site, dispatch ) {
		ThemeHelper.trackClick( 'customizer', 'activate' );

		page( '/design/' + site.slug );

		dispatch( activated( id, site, 'customizer' ) );

		Dispatcher.handleViewAction( {
			type: 'ACTIVATED_THEME_WITH_CUSTOMIZER',
			id: id,
			site: site
		} );
	},

	close: function( previousPath ) {
		if ( previousPath.indexOf( '/design' ) > -1 ) {
			ThemeHelper.trackClick( 'customizer', 'close' );
		}

		Dispatcher.handleViewAction( {
			type: 'CLOSED_CUSTOMIZER',
			previousPath: previousPath
		} );
	}
};

module.exports = CustomizeActions;
