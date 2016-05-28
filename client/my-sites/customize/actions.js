/**
 * External dependencies
 */
import defer from 'lodash/defer';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import page from 'page';
import wpcom from 'lib/wp';
import { addItem } from 'lib/upgrades/actions/cart';
import { trackClick } from '../themes/helpers';
import { themeItem } from 'lib/cart-values/cart-items';

var CustomizeActions = {
	purchase: function( id, site ) {
		addItem( themeItem( id, 'customizer' ) );

		trackClick( 'customizer', 'purchase' );

		defer( function() {
			page( '/checkout/' + site.slug );

			Dispatcher.handleViewAction( {
				type: 'THEME_PURCHASE_WITH_CUSTOMIZER',
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
		trackClick( 'customizer', 'activate' );

		page( '/design/' + site.slug );

		themeActivated( id, site, 'customizer' );

		Dispatcher.handleViewAction( {
			type: 'THEME_ACTIVATED_WITH_CUSTOMIZER',
			id: id,
			site: site
		} );
	},

	close: function( previousPath ) {
		if ( previousPath.indexOf( '/design' ) > -1 ) {
			trackClick( 'customizer', 'close' );
		}

		Dispatcher.handleViewAction( {
			type: 'CLOSED_CUSTOMIZER',
			previousPath: previousPath
		} );
	}
};

module.exports = CustomizeActions;
