/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection } from 'my-sites/controller';
import { renderPage } from 'lib/react-helpers';
import ProductForm from './app/products/product-form';
import Dashboard from './app/dashboard';

const Controller = {
	dashboard: function( context ) {
		renderPage( context, <Dashboard /> );
	},

	addProduct: function( context ) {
		renderPage( context, <ProductForm /> );
	}
};

export default function() {
	page( '/store/:site?', siteSelection, navigation, Controller.dashboard );
	page( '/store/:site?/products/add', siteSelection, navigation, Controller.addProduct );
}
