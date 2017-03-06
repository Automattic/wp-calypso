/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import { renderWithReduxStore } from 'lib/react-helpers';
import Main from 'components/main';
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import ProductsForm from './products/products-form';

export default {

	dashboard: function( context ) {
		renderWithReduxStore( (
			<Main className="woocommerce__main">
				<SectionHeader label="WooCommerce Store" />
				<Card>
					<p>This is the start of something great!</p>
					<p>This will be the home for your WooCommerce Store integration with WordPress.com.</p>
				</Card>
			</Main>
		), document.getElementById( 'primary' ), context.store );
	},

	productsAdd: function( context ) {
		renderWithReduxStore(
			React.createElement( ProductsForm, { } ),
			document.getElementById( 'primary' ),
			context.store
		);
	}

};
