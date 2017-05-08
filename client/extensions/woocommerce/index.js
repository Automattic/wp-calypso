/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import config from 'config';

/**
 * Internal dependencies
 */
import { navigation, siteSelection } from 'my-sites/controller';
import { renderWithReduxStore } from 'lib/react-helpers';
import ProductCreate from './app/products/product-create';
import Dashboard from './app/dashboard';
import StatsController from './app/stats/controller';

const Controller = {
	dashboard: function( context ) {
		renderWithReduxStore(
			React.createElement( Dashboard, { } ),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	addProduct: function( context ) {
		renderWithReduxStore(
			React.createElement( ProductCreate, { } ),
			document.getElementById( 'primary' ),
			context.store
		);
	}
};

export default function() {
	if ( config.isEnabled( 'woocommerce/extension-dashboard' ) ) {
		page( '/store/:site', siteSelection, navigation, Controller.dashboard );
		page( '/store/products/:site/add', siteSelection, navigation, Controller.addProduct );
	}

	if ( config.isEnabled( 'woocommerce/extension-stats' ) ) {
		page( '/store/stats/:type/:period/:site', siteSelection, navigation, StatsController );
	}
}
