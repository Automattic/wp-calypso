/** @format */

/**
 * External dependencies
 */

import i18n from 'i18n-calypso';
import React from 'react';
import { isEmpty } from 'lodash';
import page, { Route } from 'page';

/**
 * Internal Dependencies
 */
import analytics from 'lib/analytics';
import route from 'lib/route';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { setSection } from 'state/ui/actions';
import productsFactory from 'lib/products-list';
import { addItem } from 'lib/upgrades/actions';
import { getSiteBySlug } from 'state/sites/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import GsuiteNudge from 'my-sites/checkout/gsuite-nudge';

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
	checkout: function( context, next ) {
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
		const Checkout = require( './checkout' ),
			CheckoutData = require( 'components/data/checkout' ),
			CartData = require( 'components/data/cart' ),
			SecondaryCart = require( './cart/secondary-cart' );

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
		const CheckoutThankYouComponent = require( './checkout-thank-you' ),
			{ routePath, routeParams } = route.sectionifyWithRoutes( context.path, checkoutRoutes ),
			receiptId = Number( context.params.receiptId ),
			gsuiteReceiptId = Number( context.params.gsuiteReceiptId ) || 0;

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
		const { domain, site, receiptId } = context.params;
		context.store.dispatch( setSection( { name: 'gsuite-nudge' }, { hasSidebar: false } ) );

		const state = context.store.getState();
		const selectedSite =
			getSelectedSite( state ) || getSiteBySlug( state, site ) || getSiteBySlug( state, domain );

		if ( ! selectedSite ) {
			return null;
		}

		const handleAddGoogleApps = ( googleAppsCartItem, siteSlug ) => {
			googleAppsCartItem.extra = {
				...googleAppsCartItem.extra,
				receipt_for_domain: receiptId,
			};

			addItem( googleAppsCartItem );
			page( `/checkout/${ siteSlug }` );
		};

		const handleClickSkip = siteSlug => {
			page( `/checkout/thank-you/${ siteSlug }/${ receiptId }` );
		};

		context.primary = (
			<GsuiteNudge
				domain={ domain }
				productsList={ productsList }
				receiptId={ Number( receiptId ) }
				selectedSiteId={ selectedSite.ID }
				onAddGoogleApps={ handleAddGoogleApps }
				onClickSkip={ handleClickSkip }
			/>
		);

		next();
	},
};
