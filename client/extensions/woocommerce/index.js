/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection } from 'my-sites/controller';
import ProductForm from './products/product-form';
import Dashboard from './dashboard';

import { makeLayout, render as clientRender } from 'controller';

const Controller = {
	dashboard: function(context, next) {
	    context.primary = React.createElement( Dashboard, { } );
		next();
	},

	addProduct: function(context, next) {
	    context.primary = React.createElement( ProductForm, { } );
		next();
	}
};

export default function() {
	page(
	    '/store/:site?',
		siteSelection,
		navigation,
		Controller.dashboard,
		makeLayout,
		clientRender
	);
	page(
	    '/store/:site?/products/add',
		siteSelection,
		navigation,
		Controller.addProduct,
		makeLayout,
		clientRender
	);
}
