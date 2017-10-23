/**
 * External Dependencies
 *
 * @format
 */

import i18n from 'i18n-calypso';
import ReactDom from 'react-dom';
import React from 'react';
import { isEmpty } from 'lodash';
import { Route } from 'page';

/**
 * Internal Dependencies
 */
import analytics from 'lib/analytics';
import route from 'lib/route';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { setSection } from 'state/ui/actions';
import productsFactory from 'lib/products-list';
import { renderWithReduxStore } from 'lib/react-helpers';
import { getSelectedSite } from 'state/ui/selectors';

/**
 * Module variables
 */
const productsList = productsFactory();

const checkoutRoutes = [
	new Route( '/checkout/thank-you' ),
	new Route( '/checkout/thank-you/:receipt' ),
	new Route( '/checkout/:product' ),
	new Route( '/checkout/:product/renew/:receipt' ),
];

export default {
	checkout: function( context ) {
		const Checkout = require( './checkout' ),
			CheckoutData = require( 'components/data/checkout' ),
			CartData = require( 'components/data/cart' ),
			SecondaryCart = require( './cart/secondary-cart' ),
			{ routePath, routeParams } = route.sectionifyWithRoutes( context.path, checkoutRoutes ),
			product = context.params.product,
			selectedFeature = context.params.feature;

		const state = context.store.getState();
		const selectedSite = getSelectedSite( state );

		if ( 'thank-you' === product ) {
			return;
		}

		analytics.pageView.record( routePath, 'Checkout', routeParams );

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Checkout' ) ) );

		renderWithReduxStore(
			<CheckoutData>
				<Checkout
					product={ product }
					productsList={ productsList }
					purchaseId={ context.params.purchaseId }
					selectedFeature={ selectedFeature }
					couponCode={ context.query.code }
				/>
			</CheckoutData>,
			document.getElementById( 'primary' ),
			context.store
		);

		renderWithReduxStore(
			<CartData>
				<SecondaryCart selectedSite={ selectedSite } />
			</CartData>,
			document.getElementById( 'secondary' ),
			context.store
		);
	},

	sitelessCheckout: function( context ) {
		const Checkout = require( './checkout' ),
			CheckoutData = require( 'components/data/checkout' ),
			CartData = require( 'components/data/cart' ),
			SecondaryCart = require( './cart/secondary-cart' );

		analytics.pageView.record( '/checkout/no-site', 'Checkout' );

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Checkout' ) ) );

		renderWithReduxStore(
			<CheckoutData>
				<Checkout reduxStore={ context.store } productsList={ productsList } />
			</CheckoutData>,
			document.getElementById( 'primary' ),
			context.store
		);

		renderWithReduxStore(
			<CartData>
				<SecondaryCart />
			</CartData>,
			document.getElementById( 'secondary' ),
			context.store
		);
	},

	checkoutThankYou: function( context ) {
		const CheckoutThankYouComponent = require( './checkout-thank-you' ),
			{ routePath, routeParams } = route.sectionifyWithRoutes( context.path, checkoutRoutes ),
			receiptId = Number( context.params.receiptId );

		analytics.pageView.record( routePath, 'Checkout Thank You', routeParams );

		context.store.dispatch( setSection( { name: 'checkout-thank-you' }, { hasSidebar: false } ) );

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Thank You' ) ) );

		const state = context.store.getState();
		const selectedSite = getSelectedSite( state );

		renderWithReduxStore(
			<CheckoutThankYouComponent
				productsList={ productsList }
				receiptId={ receiptId }
				domainOnlySiteFlow={ isEmpty( context.params.site ) }
				selectedFeature={ context.params.feature }
				selectedSite={ selectedSite }
			/>,
			document.getElementById( 'primary' ),
			context.store
		);

		ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
	},
};
