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
import ProductForm from './app/products/product-form';
import Dashboard from './app/dashboard';
import Stats from './app/stats';

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
			React.createElement( ProductForm, { } ),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	stats: function( context ) {
		renderWithReduxStore(
			React.createElement( Stats, { } ),
			document.getElementById( 'primary' ),
			context.store
		);
	}
};

export default function() {
	if ( config.isEnabled( 'woocommerce/extension-dashboard' ) ) {
		page( '/store/:site?', siteSelection, navigation, Controller.dashboard );
		page( '/store/products/add/:site?', siteSelection, navigation, Controller.addProduct );
	}

	if ( config.isEnabled( 'woocommerce/extension-stats' ) ) {
		page( '/store/stats/:site?', siteSelection, navigation, Controller.stats );
	}
}
