/**
 * External dependencies
 */
var defer = require( 'lodash/defer' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	page = require( 'page' ),
	wpcom = require( 'lib/wp' ),
	CartActions = require( 'lib/upgrades/actions' ),
	ThemeHelper = require( '../themes/helpers' ),
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

	// TODO: Once this entire module is converted to Redux,
	// `themeActivated` shouldn't be passed as an argument anymore,
	// but directly imported and dispatch()ed from inside `activated()`,
	// which needs to be turned into a Redux thunk.
	activated: function( id, site, themeActivated ) {
		ThemeHelper.trackClick( 'customizer', 'activate' );

		page( '/design/' + site.slug );

		themeActivated( id, site, 'customizer' );

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
