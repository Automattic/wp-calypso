/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection } from 'my-sites/controller';
import { renderWithReduxStore } from 'lib/react-helpers';
import ProductForm from './products/product-form';
import Dashboard from './dashboard';

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
	}
};

export default function() {
	page( '/store/:site?', siteSelection, navigation, Controller.dashboard );
	page( '/store/:site?/products/add', siteSelection, navigation, Controller.addProduct );
}
