/** @format */
/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import React from 'react';
import { isEmpty } from 'lodash';
import { Route } from 'page';

/**
 * Internal Dependencies
 */
import analytics from 'lib/analytics';
import { sectionifyWithRoutes } from 'lib/route';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { setSection } from 'state/ui/actions';
import productsFactory from 'lib/products-list';
import { getSiteBySlug } from 'state/sites/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import GsuiteNudge from 'my-sites/checkout/gsuite-nudge';
import Checkout from './checkout';
import CheckoutData from 'components/data/checkout';
import CartData from 'components/data/cart';
import SecondaryCart from './cart/secondary-cart';
import CheckoutThankYouComponent from './checkout-thank-you';

/**
 * Module variables
 */
const productsList = productsFactory();

const checkoutRoutes = [
	new Route( '/checkout/thank-you' ),
	new Route( '/checkout/thank-you/:receipt' ),
	new Route( '/checkout/:product' ),
	new Route( '/checkout/:product/renew/:receipt' ),
	new Route( '/checkout/:site/with-gsuite/:domain/:receipt' ),
];

export default {
	checkout: function( context, next ) {
		const { routePath, routeParams } = sectionifyWithRoutes( context.path, checkoutRoutes );
		const product = context.params.product;
		const selectedFeature = context.params.feature;

		const state = context.store.getState();
		const selectedSite = getSelectedSite( state );

		if ( 'thank-you' === product ) {
			return;
		}

		analytics.pageView.record( routePath, 'Checkout', routeParams );

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Checkout' ) ) );

		context.primary = (
			<CheckoutData>
				<Checkout
					product={ product }
					productsList={ productsList }
					purchaseId={ context.params.purchaseId }
					selectedFeature={ selectedFeature }
					couponCode={ context.query.code }
				/>
			</CheckoutData>
		);

		context.secondary = (
			<CartData>
				<SecondaryCart selectedSite={ selectedSite } />
			</CartData>
		);
		next();
	},

	sitelessCheckout: function( context, next ) {
		analytics.pageView.record( '/checkout/no-site', 'Checkout' );

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Checkout' ) ) );

		context.primary = (
			<CheckoutData>
				<Checkout reduxStore={ context.store } productsList={ productsList } />
			</CheckoutData>
		);

		context.secondary = (
			<CartData>
				<SecondaryCart />
			</CartData>
		);
		next();
	},

	checkoutThankYou: function( context, next ) {
		const { routePath, routeParams } = sectionifyWithRoutes( context.path, checkoutRoutes );
		const receiptId = Number( context.params.receiptId );
		const gsuiteReceiptId = Number( context.params.gsuiteReceiptId ) || 0;

		analytics.pageView.record( routePath, 'Checkout Thank You', routeParams );

		context.store.dispatch( setSection( { name: 'checkout-thank-you' }, { hasSidebar: false } ) );

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Thank You' ) ) );

		const state = context.store.getState();
		const selectedSite = getSelectedSite( state );

		context.primary = (
			<CheckoutThankYouComponent
				productsList={ productsList }
				receiptId={ receiptId }
				gsuiteReceiptId={ gsuiteReceiptId }
				domainOnlySiteFlow={ isEmpty( context.params.site ) }
				selectedFeature={ context.params.feature }
				selectedSite={ selectedSite }
			/>
		);

		next();
	},

	gsuiteNudge( context, next ) {
		const { routePath, routeParams } = sectionifyWithRoutes( context.path, checkoutRoutes );
		const { domain, site, receiptId } = context.params;
		context.store.dispatch( setSection( { name: 'gsuite-nudge' }, { hasSidebar: false } ) );

		const state = context.store.getState();
		const selectedSite =
			getSelectedSite( state ) || getSiteBySlug( state, site ) || getSiteBySlug( state, domain );

		if ( ! selectedSite ) {
			return null;
		}

		analytics.pageView.record( routePath, 'G Suite Upsell', routeParams );

		context.primary = (
			<CartData>
				<GsuiteNudge
					domain={ domain }
					productsList={ productsList }
					receiptId={ Number( receiptId ) }
					selectedSiteId={ selectedSite.ID }
				/>
			</CartData>
		);

		next();
	},
};
